import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import categoryModel from '../models/categoryModel.js';
import productModel from '../models/productModel.js';

async function setupDatabase() {
  const uri = await fs.readFile('.mongo-uri', 'utf-8');
  await mongoose.connect(uri);

  const category = new categoryModel({
    name: 'Books',
    slug: 'books',
  });
  await category.save();

  const product = new productModel({
    name: 'Best Book',
    slug: 'best-book',
    description: 'This is the best book ever.',
    price: 20,
    category: category._id,
    quantity: 1,
  });
  await product.save();
}

async function cleanupDatabase() {
  await categoryModel.deleteOne({ slug: 'books' });
  await productModel.deleteOne({ slug: 'best-book' });
  await mongoose.disconnect();
}

test.beforeEach(async () => {
  await setupDatabase();
});

test.afterEach(async () => {
  await cleanupDatabase();
});

test('cart page displays correct information for guest and user after logging in', async ({ page }) => {
  await page.goto('http://localhost:3000/cart');
  
  await expect(page.locator('text=Please login to checkout')).toBeVisible();

  await page.evaluate(() => {
    localStorage.setItem('auth', JSON.stringify({ token: 'fake-token', user: { name: 'John Doe', address: '123 Main St' }}));
  });

  await page.reload();

  await expect(page.locator('text=Hello John Doe')).toBeVisible();
  await expect(page.locator('text=123 Main St')).toBeVisible();
});

test('cart item can be removed', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    
    await page.evaluate(() => {
      const cart = [
        { _id: '1', name: 'Best Book', price: 20, description: 'This book is the best ever.' },
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
    });
    
    await page.reload();
    
    await expect(page.locator('text=Best Book')).toBeVisible();
    
    await page.click('button:has-text("Remove")');
    
    await expect(page.locator('text=Best Book')).not.toBeVisible();
});

test('cart summary displays correct total price', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    
    await page.evaluate(() => {
      const cart = [
        { _id: '1', name: 'Best Book', price: 20, description: 'This book is the best ever.' },
        { _id: '2', name: 'Best Laptop', price: 1000, description: 'This laptop is the best ever.' },
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
    });
  
    await page.reload();
    
    await expect(page.locator('text=Total : $1,020.00')).toBeVisible();
});

test('payment button is disabled when conditions are not met', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    
    await page.evaluate(() => {
      const cart = [
        { _id: '1', name: 'Best Book', price: 20, description: 'This book is the best ever.' },
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
    });
  
    await page.reload();
    
    var paymentButton = page.locator('button:has-text("Make Payment")');
    var buttonCount = await paymentButton.count();
    
    if (buttonCount === 0) {
        console.log('Payment button is not displayed because conditions are not met');
    } else {
        await expect(paymentButton).toBeDisabled();
    }
    
    await page.evaluate(() => {
      localStorage.setItem('auth', JSON.stringify({ token: 'fake-token', user: { name: 'John Doe', address: '123 Main St' }}));
    });
  
    await page.reload();
    
    paymentButton = page.locator('button:has-text("Make Payment")');
    buttonCount = await paymentButton.count();
    
    if (buttonCount === 0) {
        console.log('Payment button is not displayed because conditions are not met');
    } else {
        await expect(paymentButton).toBeDisabled();
    }
    
    await page.evaluate(() => {
      window.clientToken = 'fake-client-token';
    });
  
    await page.reload();
    
    await expect(page.locator('button:has-text("Make Payment")')).toBeEnabled();
  });
  