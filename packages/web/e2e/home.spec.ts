import { test, expect } from "@playwright/test";

test("home page loads with FontOps branding", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "FontOps" })).toBeVisible();
  await expect(page.getByText(/Subset, convert and QA/i)).toBeVisible();
});

test("privacy and terms pages", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: /Terms/i })).toBeVisible();
});

test("seo landing routes", async ({ page }) => {
  await page.goto("/woff2-converter");
  await expect(page.getByRole("heading", { name: /WOFF2 Converter/i })).toBeVisible();
});
