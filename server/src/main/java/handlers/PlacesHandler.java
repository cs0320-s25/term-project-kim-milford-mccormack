package handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

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
    int radius = Integer.parseInt(queryParams.getOrDefault("radius", "800"));
    String keyword = queryParams.getOrDefault("keyword", "cafe");

    try {
      String rawNearbyJson = client.searchNearbyAsJson(lat, lng, radius, keyword);
      String enrichedJson = enrichWithPlaceDetails(rawNearbyJson);

      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, enrichedJson.getBytes().length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(enrichedJson.getBytes());
      }
    } catch (Exception e) {
      String error = "{\"error\":\"" + e.getMessage() + "\"}";
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(500, error.length());
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(error.getBytes());
      }
    }
  }

  private Map<String, String> parseQuery(String query) throws IOException {
    Map<String, String> params = new HashMap<>();
    if (query == null || query.isEmpty()) return params;

    for (String param : query.split("&")) {
      String[] keyValue = param.split("=");
      if (keyValue.length == 2) {
        String key = URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8);
        String value = URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
        params.put(key, value);
      }
    }
    return params;
  }

  private String enrichWithPlaceDetails(String rawNearbyJson) throws IOException, InterruptedException {
    JsonObject root = JsonParser.parseString(rawNearbyJson).getAsJsonObject();
    JsonArray results = root.getAsJsonArray("results");
    JsonArray enrichedResults = new JsonArray();

    for (int i = 0; i < results.size(); i++) {
      JsonObject place = results.get(i).getAsJsonObject();
      String placeId = place.get("place_id").getAsString();

      String detailsJson = client.getPlaceDetailsAsJson(placeId);
      JsonObject detailsRoot = JsonParser.parseString(detailsJson).getAsJsonObject();
      JsonObject details = detailsRoot.getAsJsonObject("result");

      JsonObject enrichedPlace = new JsonObject();

      enrichedPlace.addProperty("name", details.get("name").getAsString());

      if (details.has("vicinity")) {
        enrichedPlace.addProperty("address", details.get("vicinity").getAsString());
      }

      if (details.has("geometry")) {
        enrichedPlace.add("location", details.getAsJsonObject("geometry").getAsJsonObject("location").deepCopy());
      }

      if (details.has("rating")) {
        enrichedPlace.addProperty("rating", details.get("rating").getAsDouble());
      } else {
        enrichedPlace.addProperty("rating", -1.0);
      }

      if (details.has("opening_hours") && details.getAsJsonObject("opening_hours").has("open_now")) {
        enrichedPlace.addProperty("open_now", details.getAsJsonObject("opening_hours").get("open_now").getAsBoolean());
      } else {
        enrichedPlace.addProperty("open_now", false);
      }

      if (details.has("editorial_summary") && details.getAsJsonObject("editorial_summary").has("overview")) {
        enrichedPlace.addProperty("description", details.getAsJsonObject("editorial_summary").get("overview").getAsString());
      } else {
        enrichedPlace.addProperty("description", "No description available.");
      }

      enrichedResults.add(enrichedPlace);
    }

    JsonObject output = new JsonObject();
    output.add("results", enrichedResults);
    return gson.toJson(output);
  }
}
