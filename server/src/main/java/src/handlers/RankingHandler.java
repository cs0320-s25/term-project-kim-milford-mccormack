package src.handlers;

import com.google.gson.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import models.Preference;
import models.PreferencesRequest;

public class RankingHandler implements HttpHandler {
  private final GooglePlacesClient client = new GooglePlacesClient();
  private final Gson gson = new Gson();

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    if (!"POST".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1);
      return;
    }

    // 1) Parse request body
    String body = new String(readAll(exchange.getRequestBody()), StandardCharsets.UTF_8);
    PreferencesRequest req = gson.fromJson(body, PreferencesRequest.class);

    try {
      // 2) Fetch raw “nearby” results
      String rawNearby = client.searchNearbyAsJson(req.lat, req.lng, req.radius, null);
      JsonArray nearby =
          JsonParser.parseString(rawNearby).getAsJsonObject().getAsJsonArray("results");

      // 3) Enrich each place with details
      JsonArray enriched = new JsonArray();
      for (JsonElement elem : nearby) {
        JsonObject base = elem.getAsJsonObject();
        String placeId = base.get("place_id").getAsString();

        JsonObject details =
            JsonParser.parseString(client.getPlaceDetailsAsJson(placeId))
                .getAsJsonObject()
                .getAsJsonObject("result");

        JsonObject o = new JsonObject();
        o.addProperty("name", details.get("name").getAsString());
        if (details.has("vicinity")) {
          o.addProperty("address", details.get("vicinity").getAsString());
        }
        o.add(
            "location", details.getAsJsonObject("geometry").getAsJsonObject("location").deepCopy());
        o.addProperty("rating", details.has("rating") ? details.get("rating").getAsDouble() : -1.0);
        boolean openNow =
            details.has("opening_hours")
                && details.getAsJsonObject("opening_hours").has("open_now")
                && details.getAsJsonObject("opening_hours").get("open_now").getAsBoolean();
        o.addProperty("open_now", openNow);

        String desc =
            details.has("editorial_summary")
                    && details.getAsJsonObject("editorial_summary").has("overview")
                ? details.getAsJsonObject("editorial_summary").get("overview").getAsString()
                : "No description available.";
        o.addProperty("description", desc);

        enriched.add(o);
      }

      // 4) Wrap enriched array and delegate scoring/sorting
      JsonObject enrichedRoot = new JsonObject();
      enrichedRoot.add("results", enriched);
      String enrichedJson = gson.toJson(enrichedRoot);

      String rankedJson = rankEnriched(enrichedJson, req.preferences);

      // 5) Send back ranked JSON
      byte[] resp = rankedJson.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, resp.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(resp);
      }

    } catch (Exception e) {
      String err = "{\"error\":\"" + e.getMessage() + "\"}";
      byte[] errBytes = err.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(500, errBytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(errBytes);
      }
    }
  }

  /**
   * Scores & sorts an already-enriched JSON string. Adds "score" to each place and orders by score
   * desc, rating desc.
   */
  protected String rankEnriched(String enrichedJson, List<Preference> prefs) {
    JsonObject root = JsonParser.parseString(enrichedJson).getAsJsonObject();
    JsonArray input = root.getAsJsonArray("results");
    List<JsonObject> scored = new ArrayList<>();

    for (JsonElement el : input) {
      JsonObject place = el.getAsJsonObject();
      String desc =
          place.has("description") ? place.get("description").getAsString().toLowerCase() : "";
      int score = 0;
      for (Preference p : prefs) {
        if (desc.contains(p.keyword.toLowerCase())) {
          score += p.weight;
        }
      }
      JsonObject copy = place.deepCopy();
      copy.addProperty("score", score);
      scored.add(copy);
    }

    scored.sort(
        (a, b) -> {
          int sA = a.get("score").getAsInt(), sB = b.get("score").getAsInt();
          if (sA != sB) return Integer.compare(sB, sA);
          double rA = a.get("rating").getAsDouble(), rB = b.get("rating").getAsDouble();
          return Double.compare(rB, rA);
        });

    JsonArray outArr = new JsonArray();
    scored.forEach(outArr::add);
    JsonObject outRoot = new JsonObject();
    outRoot.add("results", outArr);
    return gson.toJson(outRoot);
  }

  private static byte[] readAll(InputStream in) throws IOException {
    return in.readAllBytes();
  }
}
