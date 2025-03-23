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
  await page.goto("http://localhost:3000/policy");

  await expect(page.getByText("add privacy policy")).toBeVisible();
});
