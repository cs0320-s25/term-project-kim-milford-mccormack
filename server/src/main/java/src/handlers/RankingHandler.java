// src/handlers/RankingHandler.java
package src.handlers;

import com.google.gson.*;
import java.util.ArrayList;
import java.util.List;
import models.Preference;

/** Pure in-memory sorter. No HTTP calls here. */
public class RankingHandler {
  private final Gson gson = new Gson();

  /**
   * Scores & sorts an already‐enriched JSON string. Adds "score" to each place (desc counted) and
   * orders by score desc → rating desc.
   */
  public String rankEnriched(String enrichedJson, List<Preference> prefs) {
    JsonObject root = JsonParser.parseString(enrichedJson).getAsJsonObject();
    JsonArray input = root.getAsJsonArray("results");
    List<JsonObject> scored = new ArrayList<>();

    for (JsonElement el : input) {
      JsonObject place = el.getAsJsonObject();
      String desc =
          place.has("description") ? place.get("description").getAsString().toLowerCase() : "";
      int score = 0;
      for (Preference p : prefs) {
        if (desc.contains(p.getKeyword().toLowerCase())) {
          score += p.getWeight();
        }
      }
      JsonObject copy = place.deepCopy();
      copy.addProperty("score", score);
      scored.add(copy);
    }

    // sort by score desc, then rating desc
    scored.sort(
        (a, b) -> {
          int sa = a.get("score").getAsInt(), sb = b.get("score").getAsInt();
          if (sa != sb) return Integer.compare(sb, sa);
          double ra = a.get("rating").getAsDouble(), rb = b.get("rating").getAsDouble();
          return Double.compare(rb, ra);
        });

    JsonArray outArr = new JsonArray();
    scored.forEach(outArr::add);
    JsonObject out = new JsonObject();
    out.add("results", outArr);
    System.out.println(gson.toJson((out)));
    return gson.toJson(out);
  }
}
