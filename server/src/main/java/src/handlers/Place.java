package src.handlers;

/** Model class representing a place returned by the Places API or mocks. */
public class Place {
  private String name;
  private String vicinity;
  private double rating;
  private int score; // computed ranking score

  public Place() {
    // Default constructor for Gson
  }

  public Place(String name, String vicinity, double rating) {
    this.name = name;
    this.vicinity = vicinity;
    this.rating = rating;
    this.score = 0;
  }

  // Name
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  // Vicinity (address or area description)
  public String getVicinity() {
    return vicinity;
  }

  public void setVicinity(String vicinity) {
    this.vicinity = vicinity;
  }

  // Rating from API or mock data
  public double getRating() {
    return rating;
  }

  public void setRating(double rating) {
    this.rating = rating;
  }

  // Score used for ranking (computed by ranking logic)
  public int getScore() {
    return score;
  }

  public void setScore(int score) {
    this.score = score;
  }

  @Override
  public String toString() {
    return "Place{"
        + "name='"
        + name
        + '\''
        + ", vicinity='"
        + vicinity
        + '\''
        + ", rating="
        + rating
        + ", score="
        + score
        + '}';
  }
}
