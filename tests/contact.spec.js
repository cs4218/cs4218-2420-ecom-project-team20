import { test, expect } from "@playwright/test";
import fs from "fs/promises";
import mongoose from "mongoose";

test.beforeAll(async () => {
  const uri = await fs.readFile(".mongo-uri", "utf-8");
  await mongoose.connect(uri);
});

test.afterAll(async () => {
  await mongoose.disconnect();
});

test("Contact Us Page", async ({ page }) => {
  await page.goto("http://localhost:3000/contact");

  await expect(page).toHaveURL("http://localhost:3000/contact")
  await expect(page.getByText("CONTACT US")).toBeVisible();
  await expect(page.getByText("www.help@ecommerceapp.com")).toBeVisible();
  await expect(page.getByText("012-3456789")).toBeVisible();
  await expect(page.getByText("1800-0000-0000 (toll free)")).toBeVisible();
});
