package src.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.*;
import models.Preference;
import models.PreferencesRequest;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class MockRankingHandler implements HttpHandler {
  private final Gson gson = new Gson();

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    if (!"POST".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1);
      return;
    }

    // 1) Which file to read? (?file=path/to/data.json)
    URI uri = exchange.getRequestURI();
    Map<String, String> qp = parseQuery(uri.getQuery());
    String filePath = qp.getOrDefault("file", "server/data/all_providence_places.json");

    // 2) Parse preferences from request body
    String body = new String(readAll(exchange.getRequestBody()), StandardCharsets.UTF_8);
    PreferencesRequest req = gson.fromJson(body, PreferencesRequest.class);

    // 3) Load enriched JSON from disk
    String enrichedJson;
    try {
      enrichedJson = Files.readString(Paths.get(filePath), StandardCharsets.UTF_8);
    } catch (Exception e) {
      exchange.sendResponseHeaders(500, -1);
      return;
    }

    // 4) Delegate scoring & sorting
    String rankedJson = rankEnriched(enrichedJson, req.preferences);

    // 5) Return the ranked JSON
    byte[] resp = rankedJson.getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().add("Content-Type", "application/json");
    exchange.sendResponseHeaders(200, resp.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(resp);
    }
  }

  /**
   * Same scoring/sorting helper as in RankingHandler.
   */
  protected String rankEnriched(String enrichedJson, List<Preference> prefs) {
    JsonObject root = JsonParser.parseString(enrichedJson).getAsJsonObject();
    JsonArray  input = root.getAsJsonArray("results");
    List<JsonObject> scored = new ArrayList<>();

    for (JsonElement el : input) {
      JsonObject place = el.getAsJsonObject();
      String desc = place.has("description")
          ? place.get("description").getAsString().toLowerCase()
          : "";
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

    scored.sort((a, b) -> {
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

  private Map<String,String> parseQuery(String qs) {
    Map<String,String> m = new HashMap<>();
    if (qs == null || qs.isEmpty()) return m;
    for (String pair : qs.split("&")) {
      String[] kv = pair.split("=", 2);
      if (kv.length == 2) {
        try {
          String k = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
          String v = URLDecoder.decode(kv[1], StandardCharsets.UTF_8);
          m.put(k, v);
        } catch (IllegalArgumentException ignored) {}
      }
    }
    return m;
  }
}