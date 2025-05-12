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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import models.Preference;
import models.PreferencesRequest;

public class PlacesHandler implements HttpHandler {

  private final GooglePlacesClient client;
  private final Gson gson = new Gson();
  private final RankingHandler ranking = new RankingHandler();

  public PlacesHandler() {
    this.client = new GooglePlacesClient();
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    if (!"GET".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1);
      return;
    }

    // 1) Parse query params: lat, lng, radius (default 500), keyword
    URI uri = exchange.getRequestURI();
    Map<String,String> qp = parseQuery(uri.getRawQuery());
    double lat    = Double.parseDouble(qp.getOrDefault("lat",    "41.8240"));
    double lng    = Double.parseDouble(qp.getOrDefault("lng",    "-71.4128"));
    int    radius = Integer.parseInt  (qp.getOrDefault("radius", "500"));    // ← default 500m :contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}
    String keyword= qp.getOrDefault("keyword", "");

    try {
      // 2) ONE CALL: Nearby Search (filter by keyword if provided)
      String rawNearby = client.searchNearbyAsJson(lat, lng, radius, keyword);

      // 3) Enrich + de-duplicate + add extra fields
      String enrichedJson = enrichWithPlaceDetails(rawNearby);

      // 4) Build PreferencesRequest from keyword (weight=5)
      PreferencesRequest req = new PreferencesRequest();
      req.preferences = new ArrayList<>();
      if (!keyword.isBlank()) {
        String decoded = URLDecoder.decode(keyword, StandardCharsets.UTF_8);
        for (String kw : decoded.split("\\s+")) {
          Preference p = new Preference();
          p.keyword = kw;
          p.weight  = 5;
          req.preferences.add(p);
        }
      }

      // 5) Delegate scoring & sorting (no more API calls)
      String rankedJson = ranking.rankEnriched(enrichedJson, req.preferences);

      // 6) Send response
      byte[] resp = rankedJson.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().set("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, resp.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(resp);
      }
    } catch (Exception e) {
      String err = "{\"error\":\"" + e.getMessage() + "\"}";
      byte[] errBytes = err.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().set("Content-Type", "application/json");
      exchange.sendResponseHeaders(500, errBytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(errBytes);
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
