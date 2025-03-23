import { expect, test } from "@playwright/test";
import fs from "fs/promises";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import { hashPassword } from "../helpers/authHelper.js";

const userPassword = "safePassword";
const creditCard = {
  cardNumber: "5555555555554444",
  expirationDate: (() => {
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 2);
    return `${String(exp.getMonth() + 1).padStart(2, "0")}${String(exp.getFullYear()).slice(-2)}`;
  })(),
  cvv: "123",
};

const renderProductDescription = (desc) => desc.substring(0, 30);

test.describe("User creates an order successfully", () => {
  let user;
  let product1;
  let product2;

  test.beforeEach(async () => {
    const uri = await fs.readFile('.mongo-uri', 'utf-8');

    await mongoose.connect(uri);

    user = new userModel({
      name: "Prabhat Kumar",
      email: "prabhat@gmail.com",
      password: await hashPassword(userPassword),
      phone: "88888888",
      address: "Not Istana",
      answer: "safeAnswer",
      role: 0,
    });
    await user.save();

    const category = new categoryModel({ name: "Technology", slug: "technology" });
    await category.save();

    product1 = new productModel({
      name: "Keychron Q2",
      slug: "keychron_q2",
      description: "Amazing keyboard to empty your wallet",
      price: 250,
      category: category._id,
      quantity: 10,
      photo: {
        data: Buffer.from("keychron q2 image placeholder", "utf-8"),
        contentType: "image/jpg",
      },
      shipping: false,
    });

    product2 = new productModel({
      name: "Keychron K6",
      slug: "keychron_k6",
      description: "Amazing keyboard while not emptying your wallet",
      price: 100,
      category: category._id,
      quantity: 5,
      photo: {
        data: Buffer.from("keychron k6 image placeholder", "utf-8"),
        contentType: "image/jpg",
      },
      shipping: false,
    });

    await Promise.all([product1.save(), product2.save()]);
  });

  test.afterEach(async () => {
    await userModel.deleteOne({ email: user.email });
    await productModel.deleteMany({ slug: { $in: [product1.slug, product2.slug] } });
    await categoryModel.deleteOne({ slug: "technology" });
    await mongoose.disconnect();
  });

  test("User can login, add to cart, make payment and view order", async ({ page }) => {
    await page.goto("http://localhost:3000");

    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email ").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").fill(userPassword);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "ADD TO CART" }).nth(0).click();
    await page.getByRole("button", { name: "ADD TO CART" }).nth(1).click();

    await page.getByRole("link", { name: "Cart" }).click();

    for (const product of [product1, product2]) {
      await expect(page.getByRole("img", { name: product.name })).toBeVisible();
      await expect(page.getByText(product.name)).toBeVisible();
      await expect(page.getByText(renderProductDescription(product.description))).toBeVisible();
      await expect(page.getByText(String(product.price))).toBeVisible();
    }


    await page.getByRole("button", { name: "Paying with Card" }).click();

    await fillBraintreeField(page, "number", creditCard.cardNumber);
    await fillBraintreeField(page, "expirationDate", creditCard.expirationDate);
    await fillBraintreeField(page, "cvv", creditCard.cvv);

    await page.getByRole("button", { name: "Make Payment" }).click();

    await expect(page.getByRole("button", { name: /Ending in .* Mastercard/ })).toBeVisible();
    await expect(page.getByText("Payment Completed Successfully")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/user/orders");

    await expect(page.getByRole("heading", { name: "All Orders" })).toBeVisible();
    for (const header of ["#", "Status", "Buyer", "date", "Payment", "Quantity"]) {
      await expect(page.getByRole("columnheader", { name: header })).toBeVisible();
    }

    await expect(page.getByRole("cell", { name: user.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: "2" })).toBeVisible();

    for (const product of [product1, product2]) {
      await expect(page.getByRole("img", { name: product.name })).toBeVisible();
      await expect(page.getByText(product.name)).toBeVisible();
      await expect(page.getByText(renderProductDescription(product.description))).toBeVisible();
      await expect(page.getByText(String(product.price))).toBeVisible();
    }
  });
});

async function fillBraintreeField(page, fieldName, value) {
  const frame = await page
    .locator(`iframe[name="braintree-hosted-field-${fieldName}"]`)
    .contentFrame();
  const placeholder = fieldName === "expirationDate" ? "MM/YY" : fieldName === "cvv" ? "•••" : "•••• •••• •••• ••••";
  await frame.getByPlaceholder(placeholder).fill(value);
}
