package handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class PlacesHandler implements HttpHandler {

  private final GooglePlacesClient client;

  public PlacesHandler() {
    this.client = new GooglePlacesClient();
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    if (!"GET".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1); // Method Not Allowed
      return;
    }

    URI requestURI = exchange.getRequestURI();
    String query = requestURI.getQuery();
    Map<String, String> queryParams = parseQuery(query);

    // defaults to providence with keyword cafe, can be edited to default to user's actual location later
    double lat = Double.parseDouble(queryParams.getOrDefault("lat", "41.8240"));
    double lng = Double.parseDouble(queryParams.getOrDefault("lng", "-71.4128"));
    int radius = Integer.parseInt(queryParams.getOrDefault("radius", "1500"));
    String keyword = queryParams.getOrDefault("keyword", "cafe");

    try {
      String json = client.searchNearbyAsJson(lat, lng, radius, keyword);
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, json.getBytes().length);
      OutputStream os = exchange.getResponseBody();
      os.write(json.getBytes());
      os.close();
    } catch (Exception e) {
      String error = "{\"error\":\"" + e.getMessage() + "\"}";
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(500, error.length());
      OutputStream os = exchange.getResponseBody();
      os.write(error.getBytes());
      os.close();
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
}
