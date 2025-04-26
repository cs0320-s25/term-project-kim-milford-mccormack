package handlers;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import io.github.cdimascio.dotenv.Dotenv;


public class GooglePlacesClient {

  static Dotenv dotenv = Dotenv.load();
  static String apiKey = dotenv.get("PLACES_API_KEY");

  private static final String API_KEY = apiKey;

  private final HttpClient client;

  public GooglePlacesClient() {
    this.client = HttpClient.newHttpClient();
  }

  public String searchNearbyAsJson(double lat, double lng, int radius, String keyword) throws IOException, InterruptedException {
    String uri = String.format(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=%f,%f&radius=%d&keyword=%s&key=%s",
        lat, lng, radius, keyword, API_KEY
    );

    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(uri))
        .GET()
        .build();

    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
    return response.body();
  }
}
