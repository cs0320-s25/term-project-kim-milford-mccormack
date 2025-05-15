package src.handlers;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import models.Preference;
import models.PreferencesRequest;

public class MockRankingHandler implements HttpHandler {
  private final Gson gson = new Gson();

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    System.out.println("[MockRankingHandler] ENTER handle()");

    // Only accept POST
    if (!"POST".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1);
      return;
    }

    // Read raw request body
    InputStream bodyStream = exchange.getRequestBody();
    String requestBody = new String(bodyStream.readAllBytes(), StandardCharsets.UTF_8);
    System.out.println(
        "[MockRankingHandler] Raw request body (snippet): "
            + requestBody.substring(0, Math.min(200, requestBody.length())));

    // Parse incoming List<Place>
    List<Place> incomingPlaces;
    try {
      incomingPlaces = gson.fromJson(requestBody, new TypeToken<List<Place>>() {}.getType());
      System.out.println("[MockRankingHandler] Parsed incoming places: " + incomingPlaces.size());
      incomingPlaces.forEach(p -> System.out.println("   • " + p.getName()));
    } catch (Exception e) {
      System.err.println("[MockRankingHandler] JSON parse error:");
      e.printStackTrace();
      exchange.sendResponseHeaders(400, -1);
      return;
    }

    // Parse PreferencesRequest
    PreferencesRequest prefs;
    try {
      prefs = gson.fromJson(requestBody, PreferencesRequest.class);
      System.out.println("[MockRankingHandler] Parsed prefs: " + prefs);
    } catch (Exception e) {
      System.err.println("[MockRankingHandler] Prefs parse error; using defaults");
      prefs = new PreferencesRequest();
    }

    // Score & sort
    List<Place> rankedPlaces;
    try {
      rankedPlaces = rankPlaces(incomingPlaces, prefs);
      System.out.println("[MockRankingHandler] Ranked list size: " + rankedPlaces.size());
      System.out.println(
          "[MockRankingHandler] Ranked order: "
              + rankedPlaces.stream().map(Place::getName).collect(Collectors.joining(" → ")));
    } catch (Exception e) {
      System.err.println("[MockRankingHandler] Ranking error:");
      e.printStackTrace();
      exchange.sendResponseHeaders(500, -1);
      return;
    }

    // Serialize and send
    String responseJson = gson.toJson(rankedPlaces);
    byte[] out = responseJson.getBytes(StandardCharsets.UTF_8);
    Headers headers = exchange.getResponseHeaders();
    headers.add("Content-Type", "application/json");
    headers.add("Access-Control-Allow-Origin", "*");
    headers.add("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.add("Access-Control-Allow-Headers", "Content-Type");

    exchange.sendResponseHeaders(200, out.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(out);
    }

    System.out.println("[MockRankingHandler] EXIT handle()");
  }

  /**
   * Compute a simple keyword-based score for each Place, then sort descending by score and
   * (tie-break) by descending rating.
   */
  private List<Place> rankPlaces(List<Place> places, PreferencesRequest req) {
    // Compute score for each place
    places.forEach(
        p -> {
          int score = 0;
          String text =
              (p.getName() == null ? "" : p.getName().toLowerCase())
                  + " "
                  + (p.getVicinity() == null ? "" : p.getVicinity().toLowerCase());
          for (Preference pf : req.getPreferences()) {
            if (text.contains(pf.getKeyword().toLowerCase())) {
              score += pf.getWeight();
            }
          }
          p.setScore(score); // Assuming Place has a setScore(int) method
        });

    // Sort in-place
    places.sort(
        (a, b) -> {
          int diff = Integer.compare(b.getScore(), a.getScore());
          if (diff != 0) return diff;
          return Double.compare(b.getRating(), a.getRating());
        });

    return places;
  }
}
