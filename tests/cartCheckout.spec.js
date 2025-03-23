// @ts-check
import { test, expect } from "@playwright/test";
import fs from "fs/promises";
import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/ProductModel.js";
import userModel from "../models/userModel.js";
import { hashPassword } from "../helpers/authHelper.js";
import assert from "assert";

let adminName;
let adminEmail;
let adminPassword;
let adminPhone;
let adminUser;

test.beforeAll(async () => {
  const uri = await fs.readFile(".mongo-uri", "utf-8");

  await mongoose.connect(uri);

  adminName = "JRM-NUS";
  adminEmail = "JRAdmin@test.sg";
  adminPassword = "JRAdmin@test.sg";
  adminPhone = "12345678";
  const hashedPassword = await hashPassword(adminPassword);
  adminUser = {
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    phone: adminPhone,
    address: adminEmail,
    answer: adminEmail,
    role: 1,
  };

  const newAdminUser = new userModel(adminUser);
  await newAdminUser.save();

    const book = new productModel({
        name: 'best-book',
        slug: 'book-slug',
        description: 'this is the best book',
        price: 18,
        category: new mongoose.Types.ObjectId('64b0c0f9a4b1a33d8e4a0d0e'),
        quantity: 1,
        photo: {
            data: Buffer.from('sample photo data', 'utf-8'),
            contentType: 'image/jpeg',
        },
        shipping: false,
    });

    const laptop = new productModel({
        name: 'best-laptop',
        slug: 'laptop-slug',
        description: 'this is the best laptop',
        price: 1500,
        category: new mongoose.Types.ObjectId('74b0c0f9a4b1a33d8e4a0d0e'),
        quantity: 1,
        photo: {
            data: Buffer.from('sample photo data', 'utf-8'),
            contentType: 'image/jpeg',
        },
        shipping: false,
    });

    await book.save();
    await laptop.save();
});

test.afterEach(async () => {
  await userModel.deleteMany({ email: adminEmail });
  await productModel.deleteOne({ slug: 'book-slug' });
  await productModel.deleteOne({ slug: 'laptop-slug' });
  await mongoose.disconnect();
});

test('add to cart and checkout', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await login(page);

    await expect(page).toHaveURL('http://localhost:3000/');

    await page.getByText('ADD TO CART').first().click();
    await page.getByText('ADD TO CART').nth(1).click();

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL('http://localhost:3000/cart');
    await expect(page.getByText('best-book')).toBeVisible();
    await expect(page.getByText('best-book')).toBeVisible();
    await expect(page.getByText('Total : $1,518.00')).toBeVisible();
    await expect(page.getByText('You Have 2 items in your cart')).toBeVisible();

    await page.getByText('REMOVE').first().click();
    await expect(page.getByText('You Have 1 items in your cart')).toBeVisible();
    await expect(page.getByText('Total : $18.00')).toBeVisible();

    await page.getByText('REMOVE').first().click();
    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.getByText('Total : $0.00')).toBeVisible();
});

async function login(page) {
  const loginTab = page.getByRole("link", { name: "Login" });
  await loginTab.click();

  const emailTextbox = page.getByRole("textbox", { name: "Enter Your Email" });
  const passwordTextbox = page.getByRole("textbox", {
    name: "Enter Your Password",
  });
  const loginButton = page.getByRole("button", { name: "LOGIN" });

  await emailTextbox.click();
  await emailTextbox.fill(adminEmail);
  await emailTextbox.press("Tab");
  await passwordTextbox.fill(adminPassword);
  await loginButton.click();
}