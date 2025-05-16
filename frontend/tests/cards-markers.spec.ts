// cards-markers.spec.ts
import { test, expect } from "@playwright/test";

const APP_URL = "http://localhost:3000";

test.describe("SearchPanel ↔ Map synchronization", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and enable test mode to bypass auth
    await page.goto(APP_URL, { waitUntil: "networkidle" });
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      (window as any).__TEST_MODE__ = true;
    });

    // Sign in flow
    const emailInput = page.getByPlaceholder("Enter your email address");
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill("test@brown.edu");
    await page.click('button:has-text("Continue")');

    const passwordInput = page.getByPlaceholder("Enter your password");
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill("term6project-32");
    await page.click('button:has-text("Continue")');

    // Wait for the main search UI to load
    const searchInput = page.getByPlaceholder("Search Places");
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test("top-3 highlighted cards match top-3 highlighted markers", async ({
    page,
  }) => {
    // 1. Perform a search
    const searchInput = page.getByPlaceholder("Search Places");
    await searchInput.fill("coffee");
    await page.click('button:has-text("Continue")');

    // 2. Await rendering of cards and markers
    await page.waitForSelector("div[data-place-id][data-lat][data-lng]");
    await page.waitForSelector("div.mapboxgl-marker[data-place-id]");

    // 3. Collect the first three cards
    const cards = await page.$$eval(
      "div[data-place-id][data-lat][data-lng]",
      (els) =>
        els.slice(0, 3).map((el) => ({
          id: el.getAttribute("data-place-id"),
          lat: el.getAttribute("data-lat"),
          lng: el.getAttribute("data-lng"),
        }))
    );

    // 4. Collect the first three highlighted markers
    const markers = await page.$$eval(
      "div.mapboxgl-marker[data-place-id][data-lat][data-lng]",
      (els) =>
        els.slice(0, 3).map((el) => ({
          id: el.getAttribute("data-place-id"),
          lat: el.getAttribute("data-lat"),
          lng: el.getAttribute("data-lng"),
        }))
    );

    // 5. Compare
    expect(markers).toEqual(cards);
  });
});
