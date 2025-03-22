import { test, expect } from "@playwright/test";
import fs from "fs/promises";
import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

async function setupDatabase() {
  const uri = await fs.readFile(".mongo-uri", "utf-8");
  await mongoose.connect(uri);

  const category1 = new categoryModel({
    name: 'Books',
    slug: 'books',
  });

  const category2 = new categoryModel({
    name: 'Electronics',
    slug: 'electronics',
  });

  await category2.save();
  await category1.save();

  const book = new productModel({
    name: 'best-book',
    slug: 'book-slug',
    description: 'this is the best book',
    price: 18,
    category: category1._id,
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
    category: category2._id,
    quantity: 1,
    photo: {
      data: Buffer.from('sample photo data', 'utf-8'),
      contentType: 'image/jpeg',
    },
    shipping: false,
  });

  await book.save();
  await laptop.save();
}

async function cleanupDatabase() {
  await categoryModel.deleteOne({ slug: 'books' });
  await categoryModel.deleteOne({ slug: 'electronics' });
  await productModel.deleteOne({ slug: 'book-slug' });
  await productModel.deleteOne({ slug: 'laptop-slug' });
  await mongoose.disconnect();
}

test.beforeEach(async () => {
  await setupDatabase();
}); 

test.afterEach(async () => {
  await cleanupDatabase();
});

test('categories exist in navigation', async ({ page }) => {
  
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Categories' }).click();
  await page.getByRole('link', { name: 'All Categories' }).click();
  await expect(page.getByRole('link', { name: 'Books' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Electronics' })).toBeVisible();
  
});


test('products are correctly assigned to categories', async ({ page }) => {
  
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Categories' }).click();
  await page.getByRole('link', { name: 'All Categories' }).click();
  await page.getByRole('link', { name: 'Books' }).click();
  await expect(page.getByText('best-book')).toBeVisible();
  await expect(page.getByText('this is the best book')).toBeVisible();
  await expect(page.getByText('18')).toBeVisible();
  
});