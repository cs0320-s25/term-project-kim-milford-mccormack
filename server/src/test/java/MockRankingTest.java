import static org.junit.jupiter.api.Assertions.*;

import com.google.gson.*;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import models.Preference;
import org.junit.jupiter.api.Test;
import src.handlers.MockRankingHandler;

public class MockRankingTest {

  private static String loadTestData(String path) throws Exception {
    return Files.readString(Paths.get(path), StandardCharsets.UTF_8);
  }

  @Test
  public void testRankingWithBreakfastKeyword() throws Exception {
    String enrichedJson = loadTestData("src/test/TestingData/places_all_prov(radius=1000).json");

    List<Preference> prefs = new ArrayList<>();
    Preference p1 = new Preference();
    p1.keyword = "relaxed";
    p1.weight = 2;
    Preference p2 = new Preference();
    p2.keyword = "specialty coffee";
    p2.weight = 4;
    Preference p3 = new Preference();
    p3.keyword = "seafood";
    p3.weight = -5;
    prefs.add(p1);
    prefs.add(p2);
    prefs.add(p3);

    // instantiate with dummy args so the constructor compiles
    MockRankingHandler handler = new MockRankingHandler("ignored.json", "");
    Method m = MockRankingHandler.class.getDeclaredMethod("rankEnriched", String.class, List.class);
    m.setAccessible(true);

    String resultJson = (String) m.invoke(handler, enrichedJson, prefs);
    JsonArray results =
        JsonParser.parseString(resultJson).getAsJsonObject().getAsJsonArray("results");

    assertTrue(results.size() >= 2, "Should rank at least two results");

    JsonObject first = results.get(0).getAsJsonObject();
    assertEquals("The Shop", first.get("name").getAsString());
    assertEquals(6, first.get("score").getAsInt());

    JsonObject last = results.get(results.size() - 1).getAsJsonObject();
    assertEquals("Dune Brothers Seafood", last.get("name").getAsString());
    assertEquals(-5, last.get("score").getAsInt());
  }

  @Test
  public void testParkRankingWithKeyword() throws Exception {
    String enrichedJson = loadTestData("src/test/TestingData/places_park(radius=1000).json");

    List<Preference> prefs = new ArrayList<>();
    Preference p1 = new Preference();
    p1.keyword = "relax";
    p1.weight = 2;
    Preference p2 = new Preference();
    p2.keyword = " walk";
    p2.weight = 2;
    Preference p3 = new Preference();
    p3.keyword = "view";
    p3.weight = 1;
    Preference p4 = new Preference();
    p4.keyword = "playground";
    p4.weight = -5;
    prefs.add(p1);
    prefs.add(p2);
    prefs.add(p3);
    prefs.add(p4);

    MockRankingHandler handler = new MockRankingHandler("ignored.json", "");
    Method m = MockRankingHandler.class.getDeclaredMethod("rankEnriched", String.class, List.class);
    m.setAccessible(true);

    String resultJson = (String) m.invoke(handler, enrichedJson, prefs);
    JsonArray results =
        JsonParser.parseString(resultJson).getAsJsonObject().getAsJsonArray("results");

    assertTrue(results.size() >= 4, "Should rank at least four results");

    JsonObject first = results.get(0).getAsJsonObject();
    assertEquals("Michael S. Van Leesten Memorial Bridge", first.get("name").getAsString());
    assertEquals(3, first.get("score").getAsInt());

    JsonObject last = results.get(results.size() - 1).getAsJsonObject();
    assertEquals("Brandon's Beach", last.get("name").getAsString());
    assertEquals(-5, last.get("score").getAsInt());
  }

  @Test
  public void testAllProvAccurate() throws Exception {
    String enrichedJson = loadTestData("src/test/TestingData/all_prov_accurate(r=2km).json");

    List<Preference> prefs = new ArrayList<>();
    Preference p1 = new Preference();
    p1.keyword = "cafe";
    p1.weight = 2;
    Preference p2 = new Preference();
    p2.keyword = " japanese";
    p2.weight = 2;
    Preference p3 = new Preference();
    p3.keyword = "korean";
    p3.weight = 3;
    Preference p4 = new Preference();
    p4.keyword = "soju";
    p4.weight = 5;
    prefs.add(p1);
    prefs.add(p2);
    prefs.add(p3);
    prefs.add(p4);

    MockRankingHandler handler = new MockRankingHandler("ignored.json", "");
    Method m = MockRankingHandler.class.getDeclaredMethod("rankEnriched", String.class, List.class);
    m.setAccessible(true);

    String resultJson = (String) m.invoke(handler, enrichedJson, prefs);
    System.out.println(resultJson);
    JsonArray results =
        JsonParser.parseString(resultJson).getAsJsonObject().getAsJsonArray("results");

    assertTrue(results.size() >= 4, "Should rank at least four results");

    JsonObject first = results.get(0).getAsJsonObject();
    assertEquals("Den Den Café Asiana", first.get("name").getAsString());
    assertEquals(12, first.get("score").getAsInt());

    //    JsonObject last = results.get(results.size() - 1).getAsJsonObject();
    //    assertEquals("Brandon's Beach", last.get("name").getAsString());
    //    assertEquals(-5, last.get("score").getAsInt());
  }
}
