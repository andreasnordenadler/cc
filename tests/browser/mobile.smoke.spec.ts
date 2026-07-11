import { expect, test } from "@playwright/test";

test("mobile homepage keeps critical public actions in the viewport", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);

  await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse Solo Side Quests" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse Multiplayer Side Quests" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("mobile solo catalog remains browseable without horizontal overflow", async ({ page }) => {
  const response = await page.goto("/solo", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);

  await expect(page.getByRole("heading", { name: "Official Side Quests", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Any Game Counts/ })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
