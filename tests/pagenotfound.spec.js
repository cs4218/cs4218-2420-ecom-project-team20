// tests/pagenotfound.spec.js
import { test, expect } from "@playwright/test";

test.describe("404 Page Not Found UI tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/random2324-page");
  });

  test("should display 404 title and heading", async ({ page }) => {
    await expect(page.locator(".pnf-title")).toHaveText("404");
    await expect(page.locator(".pnf-heading")).toHaveText("Oops ! Page Not Found");
  });

  test("should display the 'Go Back' button", async ({ page }) => {
    const backButton = page.locator(".pnf-btn");
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveText("Go Back");
  });

  test("should navigate to login page when 'Go Back' button is clicked", async ({ page }) => {
    await page.locator(".pnf-btn").click();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("should have correct layout title", async ({ page }) => {
    await expect(page).toHaveTitle(/go back - page not found/);
  });

});
