import { test, expect } from "@playwright/test";

const APP_URL = "http://localhost:3000";

test.describe("SearchPanel ↔ Map synchronization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: "networkidle" });
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      (window as any).__TEST_MODE__ = true;
    });

    const emailInput = page.getByPlaceholder("Enter your email address");
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill("test@brown.edu");
    await page.click('button:has-text("Continue")');

    const passwordInput = page.getByPlaceholder("Enter your password");
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill("term6project-32");
    await page.click('button:has-text("Continue")');

    const searchInput = page.getByPlaceholder("Search Places");
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test("top-3 highlighted cards match top-3 highlighted markers", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search Places");
    await searchInput.fill("coffee");
    await page.click('button:has-text("Continue")');

    await page.waitForSelector("div[data-place-id][data-lat][data-lng]");
    await page.waitForSelector("div.mapboxgl-marker[data-place-id]");

    const cards = await page.$$eval(
      "div[data-place-id][data-lat][data-lng]",
      (els) =>
        els.slice(0, 3).map((el) => ({
          id: el.getAttribute("data-place-id"),
          lat: el.getAttribute("data-lat"),
          lng: el.getAttribute("data-lng"),
        }))
    );

    const markers = await page.$$eval(
      "div.mapboxgl-marker[data-place-id][data-lat][data-lng]",
      (els) =>
        els.slice(0, 3).map((el) => ({
          id: el.getAttribute("data-place-id"),
          lat: el.getAttribute("data-lat"),
          lng: el.getAttribute("data-lng"),
        }))
    );

    expect(markers).toEqual(cards);
  });
});
