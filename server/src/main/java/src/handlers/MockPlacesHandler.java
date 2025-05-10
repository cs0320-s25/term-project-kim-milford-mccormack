package src.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

public class MockPlacesHandler implements HttpHandler {

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    // Only allow GET method
    if (!"GET".equals(exchange.getRequestMethod())) {
      exchange.sendResponseHeaders(405, -1); // 405 Method Not Allowed
      return;
    }

    // Load the mock data using a relative path from the working directory
    String filePath = "server/data/places_cafe(radius=1000).json";
    String jsonResponse;

    try {
      byte[] bytes = Files.readAllBytes(Paths.get(filePath));
      jsonResponse = new String(bytes, StandardCharsets.UTF_8);
    } catch (IOException e) {
      String errorMsg = "{\"error\":\"Could not read mock data from " + filePath + ".\"}";
      exchange.sendResponseHeaders(500, errorMsg.length());
      OutputStream os = exchange.getResponseBody();
      os.write(errorMsg.getBytes(StandardCharsets.UTF_8));
      os.close();
      return;
    }

    exchange.getResponseHeaders().set("Content-Type", "application/json");
    exchange.sendResponseHeaders(200, jsonResponse.getBytes(StandardCharsets.UTF_8).length);

    OutputStream os = exchange.getResponseBody();
    os.write(jsonResponse.getBytes(StandardCharsets.UTF_8));
    os.close();
  }
}
