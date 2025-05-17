import { test as setup } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import path from "path";

const STORAGE = path.join(__dirname, "playwright/.clerk/user.json");

setup("Configure Clerk for Playwright", async () => {
  // inject the Clerk testing tokens to bypass bot protection
  await clerkSetup();
});

setup("Authenticate once and save state", async ({ page, context }) => {
  // 1) Go to your app so Clerk UI loads
  await page.goto("http://localhost:3000/");

  // 2) Sign in with your test user
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });

  // 3) Verify we're in a protected route (optional)
  await page.goto("http://localhost:3000/protected");
  // await expect(page.locator('text=Protected Page')).toBeVisible();

  // 4) Save the authenticated storage state
  await context.storageState({ path: STORAGE });
});
