import { expect, test } from "@playwright/test";

test("home page loads with the LLM-MBTI title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/LLM-MBTI Recommender/);
});
