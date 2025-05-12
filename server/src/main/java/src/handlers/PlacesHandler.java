package src.handlers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class PlacesHandler implements HttpHandler {

  private final GooglePlacesClient client;
  private final Gson gson = new Gson();

  public PlacesHandler() {
    this.client = new GooglePlacesClient();
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    if (!"GET".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1);
      return;
    }

    URI requestURI = exchange.getRequestURI();
    String query = requestURI.getQuery();
    Map<String, String> queryParams = parseQuery(query);

    double lat = Double.parseDouble(queryParams.getOrDefault("lat", "41.8240"));
    double lng = Double.parseDouble(queryParams.getOrDefault("lng", "-71.4128"));
    int radius = Integer.parseInt(queryParams.getOrDefault("radius", "5"));
    String keyword = queryParams.getOrDefault("keyword", "cafe");

    try {
      String rawNearbyJson = client.searchNearbyAsJson(lat, lng, radius, keyword);
      String enrichedJson = enrichWithPlaceDetails(rawNearbyJson);

      exchange.getResponseHeaders().add("Content-Type", "application/json");
      byte[] out = enrichedJson.getBytes(StandardCharsets.UTF_8);
      exchange.sendResponseHeaders(200, out.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(out);
      }
    } catch (Exception e) {
      String error = "{\"error\":\"" + e.getMessage() + "\"}";
      byte[] out = error.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(500, out.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(out);
      }
    }
  }

  private Map<String, String> parseQuery(String query) throws IOException {
    Map<String, String> params = new HashMap<>();
    if (query == null || query.isEmpty()) return params;
    for (String param : query.split("&")) {
      String[] kv = param.split("=");
      if (kv.length == 2) {
        params.put(
            URLDecoder.decode(kv[0], StandardCharsets.UTF_8),
            URLDecoder.decode(kv[1], StandardCharsets.UTF_8));
      }
    }
    return params;
  }

  private String enrichWithPlaceDetails(String rawNearbyJson)
      throws IOException, InterruptedException {
    JsonObject root = JsonParser.parseString(rawNearbyJson).getAsJsonObject();
    JsonArray results = root.getAsJsonArray("results");
    JsonArray enrichedResults = new JsonArray();

    Set<String> seenPlaceIds = new HashSet<>();

    for (int i = 0; i < results.size(); i++) {
      JsonObject place = results.get(i).getAsJsonObject();
      String placeId = place.get("place_id").getAsString();

      // Skip duplicate place IDs
      if (!seenPlaceIds.add(placeId)) continue;

      String detailsJson = client.getPlaceDetailsAsJson(placeId);
      JsonObject detailsRoot = JsonParser.parseString(detailsJson).getAsJsonObject();
      JsonObject details = detailsRoot.getAsJsonObject("result");

      JsonObject enrichedPlace = new JsonObject();
      enrichedPlace.addProperty("name", details.get("name").getAsString());


      if (details.has("price_level")) {
        enrichedPlace.addProperty("price_level", details.get("price_level").getAsInt());
      } else {
        enrichedPlace.addProperty("price_level", "price level unavailable");
      }

      if (details.has("vicinity")) {
        enrichedPlace.addProperty("address", details.get("vicinity").getAsString());
      }

      if (details.has("geometry")) {
        enrichedPlace.add(
            "location", details.getAsJsonObject("geometry").getAsJsonObject("location").deepCopy());
      }

      enrichedPlace.addProperty(
          "rating", details.has("rating") ? details.get("rating").getAsDouble() : -1.0);

      enrichedPlace.addProperty(
          "open_now",
          details.has("opening_hours") && details.getAsJsonObject("opening_hours").has("open_now")
              ? details.getAsJsonObject("opening_hours").get("open_now").getAsBoolean()
              : false);

      enrichedPlace.addProperty(
          "description",
          details.has("editorial_summary")
                  && details.getAsJsonObject("editorial_summary").has("overview")
              ? details.getAsJsonObject("editorial_summary").get("overview").getAsString()
              : "No description available.");

      //enrichedPlace.addProperty("price_level", details.get("price_level").getAsInt());
      enrichedPlace.addProperty("total_ratings", details.get("user_ratings_total").getAsInt());


      enrichedResults.add(enrichedPlace);
    }

    JsonObject output = new JsonObject();
    output.add("results", enrichedResults);
    return gson.toJson(output);
  }
}
