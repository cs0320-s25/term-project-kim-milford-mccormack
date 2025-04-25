package handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;

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

    // Defaults
    double lat = 37.7749;
    double lng = -122.4194;
    int radius = 1500;
    String keyword = "cozy";

    // Optional: parse query string
    if (query != null) {
      String[] params = query.split("&");
      for (String param : params) {
        String[] keyValue = param.split("=");
        if (keyValue.length == 2) {
          switch (keyValue[0]) {
            case "lat": lat = Double.parseDouble(keyValue[1]); break;
            case "lng": lng = Double.parseDouble(keyValue[1]); break;
            case "radius": radius = Integer.parseInt(keyValue[1]); break;
            case "keyword": keyword = keyValue[1]; break;
          }
        }
      }
    }

    try {
      String json = client.searchNearbyAsJson(lat, lng, radius, keyword);
      exchange.getResponseHeaders().add("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, json.getBytes().length);
      OutputStream os = exchange.getResponseBody();
      os.write(json.getBytes());
      os.close();
    } catch (Exception e) {
      String error = "{\"error\":\"" + e.getMessage() + "\"}";
      exchange.sendResponseHeaders(500, error.length());
      OutputStream os = exchange.getResponseBody();
      os.write(error.getBytes());
      os.close();
    }
  }
}
