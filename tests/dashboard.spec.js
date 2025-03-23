import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import fs from 'fs/promises';
import dotenv from "dotenv";
import { hashPassword } from "../helpers/authHelper";
import UserModel from "../models/userModel";
dotenv.config();

let name;
let email;
let password;
let phone;
let address;

async function deleteUser(email) {
  try {
    await UserModel.deleteOne({ email });
  } catch (error) {
    console.error(error);
  }
}

test.beforeEach(async ({ page }) => {
  const uri = await fs.readFile('.mongo-uri', 'utf-8');
  
  await mongoose.connect(uri);
  await deleteUser(email);

  // Create user
  name = "User123";
  email = "user@test.sg";
  password = "password123";
  phone = "1234567890";
  address = "123 Street"
  const hashedPassword = await hashPassword(password);
  const user = new UserModel({
    name: name,
    email: email,
    password: hashedPassword,
    dob: "1990-01-01",
    phone: phone,
    address: "123 Street",
    answer: "Football",
    role: 0,
  });
  await user.save();
});

test.afterEach(async () => {
  await deleteUser(email);
  await mongoose.disconnect();
});

test.describe("Dashboard component", () => {
  test("should load dashboard component after logging in", async ({
    page,
  }) => {
    // login as user
    await page.goto("http://localhost:3000/login");
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(email);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill(password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL("http://localhost:3000");

    // navigate to dashboard
    await page.getByRole("button", { name: name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/user");

    await expect(page.getByRole('heading', { name: 'User123' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText(address)).toBeVisible();
  });
});
