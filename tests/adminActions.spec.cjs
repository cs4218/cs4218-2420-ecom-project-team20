// @ts-check
import { test, expect } from "@playwright/test";

const adminUser = {
    name: "admin@test.sg",
    email: "admin@test.sg",
    password: "admin@test.sg",
    phone: "admin@test.sg",
    address: "admin@test.sg",
  };

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test.describe("Create new category", () => {
    test("should be able to login to admin account", async ({page}) => {
        // await login(page, adminUser);
    })
})