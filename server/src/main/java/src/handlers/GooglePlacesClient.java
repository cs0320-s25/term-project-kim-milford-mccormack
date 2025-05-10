package src.handlers;

import io.github.cdimascio.dotenv.Dotenv;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GooglePlacesClient {

  private final String API_KEY;
  private final HttpClient client;
  private final Map<String, String> placeDetailsCache;

  public GooglePlacesClient() {
    Dotenv dotenv = Dotenv.load();
    this.API_KEY = dotenv.get("PLACES_API_KEY");
    this.client = HttpClient.newHttpClient();
    this.placeDetailsCache = new ConcurrentHashMap<>();
  }

  public String searchNearbyAsJson(double lat, double lng, int radius, String keyword)
      throws IOException, InterruptedException {
    String uri = String.format(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=%f,%f&radius=%d&keyword=%s&key=%s",
        lat, lng, radius, keyword, API_KEY);
    HttpRequest request = HttpRequest.newBuilder().uri(URI.create(uri)).GET().build();

    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
    return response.body();
  }

  public String getPlaceDetailsAsJson(String placeId) throws IOException, InterruptedException {
    // Check cache
    if (placeDetailsCache.containsKey(placeId)) {
      return placeDetailsCache.get(placeId);
    }

    String uri = String.format(
        "https://maps.googleapis.com/maps/api/place/details/json?place_id=%s&fields=name,vicinity,geometry,opening_hours,rating,editorial_summary&key=%s",
        placeId, API_KEY);

    HttpRequest request = HttpRequest.newBuilder().uri(URI.create(uri)).GET().build();
    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
    String responseBody = response.body();

    // Cache response
    placeDetailsCache.put(placeId, responseBody);

    return responseBody;
  }
}