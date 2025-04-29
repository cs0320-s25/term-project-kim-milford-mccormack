

import static org.junit.jupiter.api.Assertions.*;

import handlers.*;
import com.google.gson.*;
import models.Preference;
import org.junit.jupiter.api.Test;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class RankingTest {

  /** Load the enriched fixture from places.json in the test data folder. */
  private static String loadTestData(String path) throws Exception {
    byte[] bytes = Files.readAllBytes(Paths.get(path));
    return new String(bytes, StandardCharsets.UTF_8);
  }

  @Test
  public void testRankingWithBreakfastKeyword() throws Exception {
    String enrichedJson = loadTestData("src/test/TestingData/places.json");

    // Single preference: "breakfast" +2
    List<Preference> prefs = new ArrayList<>();
    Preference p = new Preference();
    p.keyword = "breakfast";
    p.weight = 2;
    prefs.add(p);

    RankingHandler handler = new RankingHandler();
    Method m = RankingHandler.class.getDeclaredMethod(
        "rankEnriched", String.class, List.class
    );
    m.setAccessible(true);
    String resultJson = (String) m.invoke(handler, enrichedJson, prefs);

    JsonArray results = JsonParser
        .parseString(resultJson)
        .getAsJsonObject()
        .getAsJsonArray("results");

    assertTrue(results.size() >= 2, "Should rank at least two results");

    // The top breakfast matches sorted by rating:
    JsonObject first = results.get(0).getAsJsonObject();
    assertEquals("Sydney Providence", first.get("name").getAsString());
    assertEquals(2, first.get("score").getAsInt());

    JsonObject second = results.get(1).getAsJsonObject();
    // Among all breakfast matches, "The Classic Cafe" has the next highest rating
    assertEquals("The Classic Cafe", second.get("name").getAsString());
    assertEquals(2, second.get("score").getAsInt());
  }

  @Test
  public void testRankingWithPastriesAndEspresso() throws Exception {
    String enrichedJson = loadTestData("src/test/TestingData/places.json");

    // Two preferences: "pastries" +1, "espresso" +1
    List<Preference> prefs = new ArrayList<>();
    Preference p1 = new Preference();
    p1.keyword = "pastries";
    p1.weight = 1;
    Preference p2 = new Preference();
    p2.keyword = "espresso";
    p2.weight = 1;
    prefs.add(p1);
    prefs.add(p2);

    RankingHandler handler = new RankingHandler();
    Method m = RankingHandler.class.getDeclaredMethod(
        "rankEnriched", String.class, List.class
    );
    m.setAccessible(true);
    String resultJson = (String) m.invoke(handler, enrichedJson, prefs);

    JsonArray results = JsonParser
        .parseString(resultJson)
        .getAsJsonObject()
        .getAsJsonArray("results");

    assertTrue(results.size() >= 2, "Should rank at least two results");

    // First should be Ellie's (score 2, highest rating among 2-scorers)
    JsonObject first = results.get(0).getAsJsonObject();
    assertEquals("Ellie's", first.get("name").getAsString());
    assertEquals(2, first.get("score").getAsInt());

    JsonObject second = results.get(1).getAsJsonObject();
    // Next is Small Point Café (score 2, second-highest rating for pastries & espresso)
    assertEquals("Small Point Café", second.get("name").getAsString());
    assertEquals(2, second.get("score").getAsInt());
  }

  @Test
  public void testParkRankingWithKeyword() throws Exception {
    String enrichedJson = loadTestData("src/test/TestingData/places(park).json");


    List<Preference> prefs = new ArrayList<>();
    Preference p1 = new Preference();
    p1.keyword = "student";
    p1.weight = 2;
    Preference p2 = new Preference();
    p2.keyword = "fountain";
    p2.weight = 2;
    Preference p3 = new Preference();
    p3.keyword = "statue";
    p3.weight = 1;
    Preference p4 = new Preference();
    p4.keyword = "Bustling";
    p4.weight = -3;
    prefs.add(p1);
    prefs.add(p2);
    prefs.add(p3);
    prefs.add(p4);
    RankingHandler handler = new RankingHandler();
    Method m = RankingHandler.class.getDeclaredMethod(
        "rankEnriched", String.class, List.class
    );
    m.setAccessible(true);
    String resultJson = (String) m.invoke(handler, enrichedJson, prefs);

    JsonArray results = JsonParser
        .parseString(resultJson)
        .getAsJsonObject()
        .getAsJsonArray("results");

    assertTrue(results.size() >= 4, "Should rank at least two results");

    // The top breakfast matches sorted by rating:
    JsonObject first = results.get(0).getAsJsonObject();
    assertEquals("Burnside Park", first.get("name").getAsString());
    assertEquals(3, first.get("score").getAsInt());

    JsonObject last = results.get(results.size()-1).getAsJsonObject();
    // Among all breakfast matches, "The Classic Cafe" has the next highest rating
    assertEquals("Main Green", last.get("name").getAsString());
    assertEquals(-1, last.get("score").getAsInt());
  }
}
