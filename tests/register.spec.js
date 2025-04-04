import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import fs from "fs/promises";
import { hashPassword } from "../helpers/authHelper";
import UserModel from "../models/userModel";

let testUserEmail;
let testUserPassword;
let hashedPassword;
let existingUserEmail;

async function deleteUser(email) {
  try {
    await UserModel.deleteOne({ email });
  } catch (error) {
    console.error(error);
  }
}

test.beforeAll(async () => {
  const uri = await fs.readFile(".mongo-uri", "utf-8");
  await mongoose.connect(uri);
});

test.beforeEach(async ({ page }) => {
  testUserEmail = "johndoe@test.com";
  testUserPassword = "johndoe@test.com";
  await deleteUser(testUserEmail);

  existingUserEmail = "janedolly@test.com";
  await deleteUser(existingUserEmail);

  hashedPassword = await hashPassword("janedolly@test.com");
  const existingUser = new UserModel({
    name: "Jane Dolly",
    email: existingUserEmail,
    password: hashedPassword,
    dob: "1995-10-10",
    phone: "0987654321",
    address: "543 Street",
    answer: "Badminton",
    role: 0,
  });
  await existingUser.save();

  await page.goto("http://localhost:3000/register");
});

test.afterEach(async () => {
  await deleteUser(testUserEmail);
  await deleteUser(existingUserEmail);
});

test.afterAll(async () => {
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
    await expect(
      page.getByRole("textbox", { name: "What is Your Favorite sports" })
    ).toBeVisible();
    await expect(page.getByPlaceholder("Enter Your DOB")).toBeVisible();
    await expect(page.getByRole("button", { name: "REGISTER" })).toBeVisible();
  });

  test("UI e2e successful registration", async ({ page }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("John Doe");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(testUserEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(testUserPassword);
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("1234567890");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");
    await page.getByPlaceholder("Enter Your DOB").fill("1990-01-01");

    const registerButton = page.getByRole("button", { name: "REGISTER" });

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/register")),
      registerButton.click(),
    ]);

    const resultToast = page.getByText(/Register Successfully, please login/);
    await expect(resultToast).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("UI e2e failed registration from existing user", async ({ page }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("Jane Dolly");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(existingUserEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("janedolly@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("0987654321");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("543 Street");
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Badminton");
    await page.getByPlaceholder("Enter Your DOB").fill("1995-10-10");

    const registerButton = page.getByRole("button", { name: "REGISTER" });

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/register")),
      registerButton.click(),
    ]);

    const resultToast = page.getByText(/Already registered, please login/);
    await expect(resultToast).toBeVisible();
    await expect(page).not.toHaveURL("http://localhost:3000/login");
    await expect(page).toHaveURL("http://localhost:3000/register");
  });

  test("UI e2e successful registration and login", async ({ page }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("John Doe");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(testUserEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(testUserPassword);
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("1234567890");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");
    await page.getByPlaceholder("Enter Your DOB").fill("1990-01-01");

    const registerButton = page.getByRole("button", { name: "REGISTER" });

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/register")),
      registerButton.click(),
    ]);
    const resultToast = page.getByText(/Register Successfully, please login/);
    await expect(resultToast).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");

    await page.getByPlaceholder("Enter Your Email").fill(testUserEmail);
    await page.getByPlaceholder("Enter Your Password").fill(testUserPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page.getByText(/Logged in successfully/)).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("UI e2e successful registration, forgotPassword and login", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: "Enter Your Name" })
      .fill("John Doe");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(testUserEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(testUserPassword);
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill("1234567890");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("123 Street");
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("Football");
    await page.getByPlaceholder("Enter Your DOB").fill("1990-01-01");

    const registerButton = page.getByRole("button", { name: "REGISTER" });

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/register")),
      registerButton.click(),
    ]);
    const resultToast = page.getByText(/Register Successfully, please login/);
    await expect(resultToast).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");

    await page.getByRole("button", { name: "Forgot Password" }).click();
    await expect(page.getByText(/FORGOT PASSWORD/)).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/forgot-password");

    await page.getByPlaceholder("Enter Your Email").fill(testUserEmail);
    await page.getByPlaceholder("Enter Your Answer").fill("Football");
    await page.getByPlaceholder("Enter Your New Password").fill("newpassword");

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText(/Password reset successfully/)).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");

    await page.getByPlaceholder("Enter Your Email").fill(testUserEmail);
    await page.getByPlaceholder("Enter Your Password").fill("newpassword");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page.getByText(/Logged in successfully/)).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/");
  });
});
