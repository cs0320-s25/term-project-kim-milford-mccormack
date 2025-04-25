package handlers;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.json.JSONArray;
import org.json.JSONObject;

public class GooglePlacesClient {

  private static final String API_KEY = System.getenv("GOOGLE_API_KEY");

  public static void search(String keyword, double lat, double lng) throws Exception {
    String encodedKeyword = keyword.replace(" ", "%20");
    String endpoint = String.format(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=%f,%f&radius=2000&keyword=%s&key=%s",
        lat, lng, encodedKeyword, API_KEY
    );

    HttpClient client = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(endpoint))
        .GET()
        .build();

    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
    JSONObject json = new JSONObject(response.body());

    JSONArray results = json.getJSONArray("results");
    for (int i = 0; i < results.length(); i++) {
      JSONObject place = results.getJSONObject(i);
      System.out.println(place.getString("name"));
    }
  }

  public static void main(String[] args) throws Exception {
    search("cozy cafe", 37.7749, -122.4194);
  }
}
