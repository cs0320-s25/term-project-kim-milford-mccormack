package models;

import java.util.List;

/**
 * Model class representing the user's preferences request, containing a list of keyword-weight
 * preferences (and optionally other filter parameters).
 */
public class PreferencesRequest {
  private List<Preference> preferences;

  public PreferencesRequest() {
    // Default constructor for Gson
  }

  public PreferencesRequest(List<Preference> preferences) {
    this.preferences = preferences;
  }

  // Preferences list
  public List<Preference> getPreferences() {
    return preferences;
  }

  public void setPreferences(List<Preference> preferences) {
    this.preferences = preferences;
  }

  @Override
  public String toString() {
    return "PreferencesRequest{" + "preferences=" + preferences + '}';
  }
}
