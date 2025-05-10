package models;

import java.util.List;

public class PreferencesRequest {
  public double lat;
  public double lng;
  public int radius;
  public List<Preference> preferences;
}
