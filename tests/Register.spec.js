import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

test.beforeEach(async ({ page }) => {
  await mongoose.connect(process.env.MONGO_URL);
  await mongoose.connection.collection("users").deleteMany({});
  await page.goto("http://localhost:3000/register");
});

test.afterEach(async () => {
  await mongoose.connection.collection("users").deleteMany({});
  await mongoose.disconnect();
});

test.describe("Register component", () => {
  test("should load register page and display form elements", async ({
    page,
  }) => {
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Password" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toBeVisible();

    await expect(
      page.getByRole("textbox", { name: "What is Your Favorite sports" })
    ).toBeVisible();
    await expect(page.locator("input[type='date']")).toBeVisible();
    await expect(page.getByRole("button", { name: "REGISTER" })).toBeVisible();
  });

  test("UI e2e successful registration", async ({ page }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("John Doe");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("johndoe@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("johndoe@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("1234567890");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");

    await page.getByPlaceholder("Enter Your DOB").fill("2025-03-20");

    const registerButton = page.getByRole("button", { name: "REGISTER" });

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/register")),
      registerButton.click(),
    ]);

    const resultToast = page.getByText(/Register Successfully, please login/);
    await expect(resultToast).toBeVisible();

    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("UI e2e failed registration", async ({ page }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("John Doe");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("johndoe@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("johndoe@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("1234567890");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");

    const dateInput = page.locator("input[type='date']");
    await dateInput.fill("1990-01-01");

    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(page).not.toHaveURL("http://localhost:3000/login");
    await expect(page).toHaveURL("http://localhost:3000/register");
  });
});
