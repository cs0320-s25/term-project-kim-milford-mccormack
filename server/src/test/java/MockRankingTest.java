// src/test/java/MockRankingHandlerHttpTest.java

import static org.junit.jupiter.api.Assertions.*;

import com.google.gson.*;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import models.Preference;
import models.PreferencesRequest;
import org.junit.jupiter.api.*;
import src.handlers.MockRankingHandler;

class MockRankingTest {
  private static HttpServer server;
  private static String baseUrl;

  @BeforeAll
  static void startServer() throws IOException {
    // bind on ephemeral port
    server = HttpServer.create(new InetSocketAddress(0), 0);
    server.createContext("/mock-ranking", new MockRankingHandler());
    server.start();
    int port = server.getAddress().getPort();
    baseUrl = "http://localhost:" + port + "/mock-ranking";
  }

  @AfterAll
  static void stopServer() {
    server.stop(0);
  }

  private JsonArray callMockRanking(String filePath, List<Preference> prefs) throws IOException {
    // build URL with file query-param
    String urlStr = baseUrl + "?file=" + URLEncoder.encode(filePath, StandardCharsets.UTF_8);
    HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
    conn.setRequestMethod("POST");
    conn.setDoOutput(true);
    conn.setRequestProperty("Content-Type", "application/json");

    // build a minimal PreferencesRequest
    PreferencesRequest req = new PreferencesRequest();
    req.lat = 41.0; // ignored by mock
    req.lng = -71.0; // ignored by mock
    req.radius = 1000; // ignored by mock
    req.preferences = prefs;

    String body = new Gson().toJson(req);
    try (OutputStream os = conn.getOutputStream()) {
      os.write(body.getBytes(StandardCharsets.UTF_8));
    }

    // assert HTTP 200
    int status = conn.getResponseCode();
    assertEquals(200, status, "Expected HTTP 200 from MockRankingHandler");

    // parse the JSON response
    try (InputStream is = conn.getInputStream();
        InputStreamReader rdr = new InputStreamReader(is, StandardCharsets.UTF_8)) {

      JsonObject root = JsonParser.parseReader(rdr).getAsJsonObject();
      // print JSON
      System.out.println(
          "MockRankingHandler returned:\n"
              + new GsonBuilder().setPrettyPrinting().create().toJson(root));
      return root.getAsJsonArray("results");
    } finally {
      conn.disconnect();
    }
  }

  @Test
  void testRankingWithBreakfastKeyword() throws Exception {
    List<Preference> prefs = new ArrayList<>();

    Preference p1 = new Preference();
    p1.keyword = "relaxed";
    p1.weight = 2;
    prefs.add(p1);

    Preference p2 = new Preference();
    p2.keyword = "specialty coffee";
    p2.weight = 4;
    prefs.add(p2);

    Preference p3 = new Preference();
    p3.keyword = "seafood";
    p3.weight = -5;
    prefs.add(p3);

    JsonArray results =
        callMockRanking("src/test/TestingData/places_all_prov(radius=1000).json", prefs);

    assertTrue(results.size() >= 2, "Should rank at least two results");

    // top scorer should be "The Shop" with score = 2 + 4 = 6
    JsonObject first = results.get(0).getAsJsonObject();
    assertEquals("The Shop", first.get("name").getAsString());
    assertEquals(6, first.get("score").getAsInt());

    // last should be the seafood spot with score = -5
    JsonObject last = results.get(results.size() - 1).getAsJsonObject();
    assertEquals("Dune Brothers Seafood", last.get("name").getAsString());
    assertEquals(-5, last.get("score").getAsInt());
  }

  @Test
  void testParkRankingWithKeyword() throws Exception {
    List<Preference> prefs = new ArrayList<>();

    Preference p1 = new Preference();
    p1.keyword = "student";
    p1.weight = 2;
    prefs.add(p1);

    Preference p2 = new Preference();
    p2.keyword = "fountain";
    p2.weight = 2;
    prefs.add(p2);

    Preference p3 = new Preference();
    p3.keyword = "statue";
    p3.weight = 1;
    prefs.add(p3);

    Preference p4 = new Preference();
    p4.keyword = "bustling";
    p4.weight = -3;
    prefs.add(p4);

    JsonArray results = callMockRanking("src/test/TestingData/places(park).json", prefs);

    assertTrue(results.size() >= 4, "Should rank at least four results");

    // "Burnside Park" should score 2 (student) + 2 (fountain) + 1 (statue) = 5
    JsonObject first = results.get(0).getAsJsonObject();
    assertEquals("Burnside Park", first.get("name").getAsString());
    assertEquals(3, first.get("score").getAsInt());

    // "Main Green" likely only matches none or negative keys: score = -3 (bustling)
    JsonObject last = results.get(results.size() - 1).getAsJsonObject();
    assertEquals("Main Green", last.get("name").getAsString());
    assertEquals(-1, last.get("score").getAsInt());
  }
}
