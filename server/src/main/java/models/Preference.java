package models;

/** Model class representing a single keyword-weight preference. */
public class Preference {
  private String keyword;
  private int weight;

  public Preference() {
    // Default constructor for Gson
  }

  public Preference(String keyword, int weight) {
    this.keyword = keyword;
    this.weight = weight;
  }

  // Keyword to match (e.g., "indoor", "coffee", etc.)
  public String getKeyword() {
    return keyword;
  }

  public void setKeyword(String keyword) {
    this.keyword = keyword;
  }

  // Weight to apply when keyword matches
  public int getWeight() {
    return weight;
  }

  public void setWeight(int weight) {
    this.weight = weight;
  }

  @Override
  public String toString() {
    return "Preference{" + "keyword='" + keyword + '\'' + ", weight=" + weight + '}';
  }
}
