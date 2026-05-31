import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const inter = path.join(dir, "../public/samples/Inter-Regular.woff2");
const interVar = path.join(dir, "../public/samples/Inter-Variable.woff2");

test("subset Inter sample by text", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(inter);
  await expect(page.getByText(/Inter-Regular\.woff2/i)).toBeVisible({ timeout: 20000 });
  await page.getByLabel(/Subset by text/i).fill("Hello");
  await page.getByRole("button", { name: /^Subset by text$/i }).click();
  await expect(page.getByRole("button", { name: /Download WOFF2/i })).toBeVisible({ timeout: 60000 });
});

test("variable font shows instance controls", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(interVar);
  await expect(page.getByText(/Inter-Variable\.woff2/i)).toBeVisible({ timeout: 25000 });
  await page.getByRole("button", { name: "Instance" }).click();
  await expect(page.getByRole("button", { name: /Bake static instance/i })).toBeVisible({ timeout: 15000 });
  await expect(page.locator('input[type="range"]').first()).toBeVisible();
});
