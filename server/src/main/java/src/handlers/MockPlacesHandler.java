package src.handlers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Mock handler for places: reads a JSON file with an object containing an array under "results",
 * parses that array into List<Place>, and returns it.
 */
public class MockPlacesHandler implements HttpHandler {
  private final Gson gson = new Gson();

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    System.out.println("[MockPlacesHandler] ENTER handle()");

    // CORS preflight
    if ("OPTIONS".equals(exchange.getRequestMethod())) {
      System.out.println("[MockPlacesHandler] OPTIONS preflight");
      exchange.sendResponseHeaders(204, -1);
      return;
    }

    // Log request URI
    URI requestUri = exchange.getRequestURI();
    System.out.println("[MockPlacesHandler] Request URI: " + requestUri);

    // Load mock-data file
    Path jsonPath = Paths.get("src", "test", "TestingData", "all_prov_accurate(r=2km).json");
    System.out.println("[MockPlacesHandler] Trying to read file at: " + jsonPath.toAbsolutePath());

    String rawJson;
    try {
      rawJson = Files.readString(jsonPath, StandardCharsets.UTF_8);
      System.out.println("[MockPlacesHandler] Loaded JSON length=" + rawJson.length());
    } catch (IOException e) {
      System.err.println("[MockPlacesHandler] Failed to load mock-data:");
      e.printStackTrace();
      exchange.sendResponseHeaders(500, -1);
      return;
    }

    // Parse top-level object, extract "results" array
    JsonObject root;
    JsonArray resultsArray;
    try {
      root = JsonParser.parseString(rawJson).getAsJsonObject();
      resultsArray = root.getAsJsonArray("results");
      System.out.println(
          "[MockPlacesHandler] Found results array of length=" + resultsArray.size());
    } catch (Exception e) {
      System.err.println("[MockPlacesHandler] JSON structure error:");
      e.printStackTrace();
      exchange.sendResponseHeaders(500, -1);
      return;
    }

    // Deserialize array into List<Place>
    List<Place> places;
    try {
      places = gson.fromJson(resultsArray, new TypeToken<List<Place>>() {}.getType());
      System.out.println("[MockPlacesHandler] Parsed places count: " + places.size());
    } catch (Exception e) {
      System.err.println("[MockPlacesHandler] JSON parse error:");
      e.printStackTrace();
      exchange.sendResponseHeaders(500, -1);
      return;
    }

    // Serialize response
    String responseJson = gson.toJson(places);
    System.out.println(
        "[MockPlacesHandler] Response JSON snippet:\n"
            + responseJson.substring(0, Math.min(200, responseJson.length()))
            + "…");

    byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
    Headers headers = exchange.getResponseHeaders();
    headers.add("Content-Type", "application/json");
    headers.add("Access-Control-Allow-Origin", "*");
    headers.add("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.add("Access-Control-Allow-Headers", "Content-Type");

    exchange.sendResponseHeaders(200, bytes.length);
    try (OutputStream os = exchange.getResponseBody()) {
      System.out.println("[MockPlacesHandler] Writing response body of length " + bytes.length);
      os.write(bytes);
    }

    System.out.println("[MockPlacesHandler] EXIT handle()");
  }
}
