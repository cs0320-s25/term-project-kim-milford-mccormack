package src.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import models.Preference;

public class MockPlacesHandler implements HttpHandler {

  private final String TEST_DATA_DIR;

  public MockPlacesHandler() {
    // Get the absolute path to the project root
    String projectRoot = new File("").getAbsolutePath();
    TEST_DATA_DIR = Paths.get(projectRoot, "src", "test", "TestingData").toString();
    System.out.println("Test data directory: " + TEST_DATA_DIR);
  }

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

    // Default mock data file
    String fileName = "all_prov_accurate(r=2km).json";

    if (keyword != null && !keyword.isEmpty()) {
      // Try to find a matching file for the keyword
      String possibleFileName = "places_" + keyword.toLowerCase() + "(radius=2000).json";
      Path possiblePath = Paths.get(TEST_DATA_DIR, possibleFileName);
      if (Files.exists(possiblePath)) {
        fileName = possibleFileName;
      }
    }

    Path filePath = Paths.get(TEST_DATA_DIR, fileName);
    System.out.println("Attempting to read file: " + filePath.toAbsolutePath());

    try {
      if (!Files.exists(filePath)) {
        throw new IOException("File does not exist: " + filePath.toAbsolutePath());
      }

      String enrichedJson = Files.readString(filePath, StandardCharsets.UTF_8);
      System.out.println("Successfully read file: " + filePath);

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

      MockRankingHandler rankingHandler = new MockRankingHandler(filePath.toString(), keyword);
      String rankedJson = rankingHandler.rankEnriched(enrichedJson, prefs);
      byte[] resp = rankedJson.getBytes(StandardCharsets.UTF_8);

      // Send the JSON response
      exchange.getResponseHeaders().set("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, resp.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(resp);
      }
    } catch (IOException e) {
      System.err.println("Error reading file: " + e.getMessage());
      e.printStackTrace();
      String errorResponse =
          "{\"error\": \"Failed to read mock data file: " + e.getMessage() + "\"}";
      byte[] errorBytes = errorResponse.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().set("Content-Type", "application/json");
      exchange.sendResponseHeaders(500, errorBytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(errorBytes);
      }
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
