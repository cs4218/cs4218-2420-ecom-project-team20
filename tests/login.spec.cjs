import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import { hashPassword } from "../helpers/authHelper.js";
import dotenv from "dotenv";
import UserModel from "../models/userModel.js";


let testUserEmail;
let testUserPassword;
let hashedPassword;

async function deleteUser(email) {
  try {
    await UserModel.deleteOne({ email });
  } catch (error) {
    console.error(error);
  }
}

test.beforeEach(async ({ page }) => {
  await mongoose.connect(process.env.MONGO_URL);

  testUserEmail = "johndoe@test.com";
  await deleteUser(testUserEmail);

  testUserPassword = "johndoe@test.com";
  hashedPassword = await hashPassword("johndoe@test.com");
  const testUser = new UserModel({
    name: "John Doe",
    email: testUserEmail,
    password: hashedPassword,
    dob: "1990-01-01",
    phone: "1234567890",
    address: "123 Street",
    answer: "Football",
    role: 0,
  });
  await testUser.save();

  const savedUser = await UserModel.findOne({ email: testUserEmail });
  expect(savedUser).not.toBeNull();
  expect(savedUser.email).toBe(testUserEmail);

  await page.goto("http://localhost:3000/login");
});

test.afterEach(async () => {
  await deleteUser(testUserEmail);
  await mongoose.disconnect();
});

test.describe("Login component", () => {
  test("should load login page and display form elements", async ({ page }) => {
    await expect(page.getByPlaceholder("Enter Your Email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter Your Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "LOGIN" })).toBeVisible();
  });

  test("should allow user to senter email and password", async ({ page }) => {
    await page.getByPlaceholder("Enter Your Email").fill("janedoe@test.com");
    await page.getByPlaceholder("Enter Your Password").fill("janedoe@test.com");

    await expect(page.getByPlaceholder("Enter Your Email")).toHaveValue(
      "janedoe@test.com"
    );
    await expect(page.getByPlaceholder("Enter Your Password")).toHaveValue(
      "janedoe@test.com"
    );
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.getByRole("button", { name: "Forgot Password" }).click();

    await expect(page).toHaveURL("http://localhost:3000/forgot-password");
  });

  test("should not allow SQL injection in email field", async ({ page }) => {
    const initialURL = page.url();
    await page.getByPlaceholder("Enter Your Email").fill("' OR '1'='1");
    await page.getByPlaceholder("Enter Your Password").fill("password");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL(initialURL);
  });

  test("UI e2e successful login", async ({ page }) => {
    await page.getByPlaceholder("Enter Your Email").fill(testUserEmail);
    await page.getByPlaceholder("Enter Your Password").fill(testUserPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText(/Logged in successfully/)).toBeVisible();

    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("UI e2e failed login - should show invalid password message upon wrong password", async ({
    page,
  }) => {
    await page.getByPlaceholder("Enter Your Email").fill(testUserEmail);
    await page.getByPlaceholder("Enter Your Password").fill("notuser@test.com");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText(/Invalid Password/)).toBeVisible();
  });

  test("UI e2e failed login - should show email not registered message if logging in with an unregistered user", async ({
    page,
  }) => {
    await page
      .getByPlaceholder("Enter Your Email")
      .fill("unregistereduser@test.sg");
    await page
      .getByPlaceholder("Enter Your Password")
      .fill("unregistereduser@test.sg");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText(/Email is not registered/)).toBeVisible();
  });
});
