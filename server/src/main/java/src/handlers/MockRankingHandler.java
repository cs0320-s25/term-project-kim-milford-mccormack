package src.handlers;

import com.google.gson.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import models.Preference;

/**
 * A MockRankingHandler that scores & sorts a pre-enriched JSON file using a fixed list of keywords
 * (weight=5) provided at construction.
 */
public class MockRankingHandler implements HttpHandler {
  private final String filePath;
  private final List<Preference> prefs;
  private final Gson gson = new Gson();

  /**
   * @param filePath path to a JSON file containing {"results":[...]}
   * @param keywords space-separated keywords (URL-decoded, so "%20"→" ")
   */
  public MockRankingHandler(String filePath, String keywords) {
    this.filePath = filePath;
    this.prefs = new ArrayList<>();

    if (keywords != null && !keywords.isBlank()) {
      // split on any whitespace (spaces, tabs) to get individual keywords
      for (String kw : keywords.split("\\s+")) {
        Preference p = new Preference();
        p.keyword = kw;
        p.weight = 5;
        this.prefs.add(p);
      }
    }
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    if (!"POST".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1);
      return;
    }

    // Load the enriched JSON
    String enrichedJson;
    try {
      enrichedJson = Files.readString(Paths.get(filePath), StandardCharsets.UTF_8);
    } catch (Exception e) {
      String err = "{\"error\":\"Cannot read mock data from " + filePath + "\"}";
      byte[] errBytes = err.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().set("Content-Type", "application/json");
      exchange.sendResponseHeaders(500, errBytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(errBytes);
      }
      return;
    }

    // Delegate scoring & sorting
    String rankedJson = rankEnriched(enrichedJson, prefs);

    // Send out the ranked JSON
    byte[] resp = rankedJson.getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().set("Content-Type", "application/json");
    exchange.sendResponseHeaders(200, resp.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(resp);
    }
  }

  /**
   * Scores & sorts an already-enriched JSON string. Adds "score" to each entry and orders by score
   * desc, then rating desc.
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
}
