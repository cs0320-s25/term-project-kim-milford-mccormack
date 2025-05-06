package src.handlers;

import com.google.gson.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
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

    // 1) Read & parse request
    String body = new String(readAll(exchange.getRequestBody()), StandardCharsets.UTF_8);
    PreferencesRequest req = gson.fromJson(body, PreferencesRequest.class);

    try {
      // 2) Fetch nearby results (no keyword filter)
      String rawNearby = client.searchNearbyAsJson(req.lat, req.lng, req.radius, null);
      JsonArray nearby =
          JsonParser.parseString(rawNearby).getAsJsonObject().getAsJsonArray("results");

      List<JsonObject> scored = new ArrayList<>();

      // 3) For each place, fetch details & compute score
      for (JsonElement elem : nearby) {
        JsonObject place = elem.getAsJsonObject();
        String placeId = place.get("place_id").getAsString();

        // pull full details
        String detailsJson = client.getPlaceDetailsAsJson(placeId);
        JsonObject details =
            JsonParser.parseString(detailsJson).getAsJsonObject().getAsJsonObject("result");

        JsonObject out = new JsonObject();
        out.addProperty("name", details.get("name").getAsString());
        out.add(
            "location", details.getAsJsonObject("geometry").getAsJsonObject("location").deepCopy());
        double rating = details.has("rating") ? details.get("rating").getAsDouble() : -1.0;
        out.addProperty("rating", rating);

        // extract description
        String desc = "No description available.";
        if (details.has("editorial_summary")) {
          JsonObject ed = details.getAsJsonObject("editorial_summary");
          if (ed.has("overview")) {
            desc = ed.get("overview").getAsString();
          }
        }
        out.addProperty("description", desc);

        // nested loops: check each preference keyword
        int score = 0;
        String lowered = desc.toLowerCase();
        for (Preference pref : req.preferences) {
          if (lowered.contains(pref.keyword.toLowerCase())) {
            score += pref.weight;
          }
        }
        out.addProperty("score", score);

        scored.add(out);
      }

      // 4) Sort by score desc, then rating desc
      scored.sort(
          (a, b) -> {
            int sA = a.get("score").getAsInt(), sB = b.get("score").getAsInt();
            if (sA != sB) return Integer.compare(sB, sA);
            double rA = a.get("rating").getAsDouble(), rB = b.get("rating").getAsDouble();
            return Double.compare(rB, rA);
          });

      // 5) Build response
      JsonArray outArr = new JsonArray();
      scored.forEach(outArr::add);
      JsonObject resp = new JsonObject();
      resp.add("results", outArr);

      byte[] bytes = gson.toJson(resp).getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, bytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(bytes);
      }

    } catch (Exception e) {
      String error = "{\"error\":\"" + e.getMessage() + "\"}";
      byte[] bytes = error.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(500, bytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(bytes);
      }
    }
  }

  // Helper to read all bytes from the request body
  private static byte[] readAll(InputStream in) throws IOException {
    return in.readAllBytes();
  }

  /** Test helper—scores & sorts an enriched JSON string. */
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
}
