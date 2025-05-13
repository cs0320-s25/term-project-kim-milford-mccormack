package src.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import models.Preference;

public class MockPlacesHandler implements HttpHandler {

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    // Only allow GET method
    if (!"GET".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1); // 405 Method Not Allowed
      return;
    }

    // Parse query parameters from the URL
    String queryString = exchange.getRequestURI().getQuery();
    Map<String, String> queryParams = parseQueryParams(queryString);

    // Extract parameters
    String lat = queryParams.get("lat");
    String lng = queryParams.get("lng");
    String radius = queryParams.get("radius");
    String keyword = queryParams.get("keyword");

    // You can now use these parameters (lat, lng, radius, keyword) to load or filter mock data
    String filePath =
        "server/src/test/TestingData/places_all_prov(radius=1000).json"; // Default mock data file
    // path
    System.out.println(filePath);
    if (keyword != null && !keyword.isEmpty()) {
      // Modify file path based on the keyword, for example (this part can be customized based on
      // your logic)

      filePath = "server/src/test/TestingData/places_" + keyword + "(radius=" + radius + ").json";

      System.out.println(filePath);
    }
    String enrichedJson = Files.readString(Paths.get(filePath), StandardCharsets.UTF_8);
    List<Preference> prefs = new ArrayList<>();
    if (keyword != null && !keyword.isBlank()) {
      String decoded = URLDecoder.decode(keyword, StandardCharsets.UTF_8);
      for (String kw : decoded.split("\\s+")) {
        if (!kw.isBlank()) {
          Preference p = new Preference();
          p.keyword = kw;
          p.weight = 5;
          prefs.add(p);
        }
      }
    }

    MockRankingHandler rankingHandler = new MockRankingHandler(filePath, keyword);
    String rankedJson = rankingHandler.rankEnriched(enrichedJson, prefs);
    byte[] resp = rankedJson.getBytes(StandardCharsets.UTF_8);

    // Send the JSON response
    exchange.getResponseHeaders().set("Content-Type", "application/json");
    exchange.sendResponseHeaders(200, resp.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(resp);
    }
  }

  // Utility method to parse query parameters
  private Map<String, String> parseQueryParams(String query) {
    Map<String, String> queryParams = new HashMap<>();
    if (query != null) {
      String[] pairs = query.split("&");
      for (String pair : pairs) {
        String[] keyValue = pair.split("=");
        if (keyValue.length == 2) {
          String key = URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8);
          String value = URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
          queryParams.put(key, value);
        }
      }
    }
    return queryParams;
  }
}
