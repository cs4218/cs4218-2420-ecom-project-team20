import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import productRoutes from './productRoutes.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';
import slugify from 'slugify';
import {hashPassword} from '../helpers/authHelper.js';

dotenv.config();

jest.mock('braintree', () => ({
  Environment: {
    Sandbox: 'sandbox'
  },
  BraintreeGateway: jest.fn().mockImplementation(() => ({
    clientToken: {
      generate: jest.fn().mockImplementation((_, callback) =>
        callback(null, { clientToken: 'mock-client-token' })
      )
    },
    transaction: {
      sale: jest.fn().mockImplementation((data, callback) => {
        if (data.paymentMethodNonce === 'fake-valid-nonce') {
          callback(null, {
            success: true,
            transaction: { id: 'mock-transaction-id' }
          });
        } else {
          callback(new Error('Invalid payment nonce'), null);
        }
      })
    }
  }))
}));


// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/product', productRoutes);

describe('Product Routes Integration Tests', () => {
  let mongoServer;
  let regularUser;
  let adminUser;
  let regularToken;
  let adminToken;
  let testCategory;
  let testProduct;
  let productId;
  let testImagePath;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    process.env.JWT_SECRET = 'test-jwt-secret';
    
    testImagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(testImagePath, Buffer.from('test image content'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
    await productModel.deleteMany({});
    await categoryModel.deleteMany({});


    regularUser = await userModel.create({
      name: 'Regular User',
      email: 'regular@test.com',
      password: await hashPassword("password123"),
      phone: '1234567890',
      address: 'Test Address',
      role: 0,
      answer: 'Test answer'
    });

    adminUser = await userModel.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: await hashPassword("password123"),
      phone: '0987654321',
      address: 'Admin Address',
      role: 1,
      answer: 'Admin answer'
    });

    testCategory = await categoryModel.create({
      name: 'Electronics',
      slug: slugify('Electronics')
    });

    testProduct = await productModel.create({
      name: 'Test Product',
      slug: slugify('Test Product'),
      description: 'This is a test product',
      price: 99.99,
      category: testCategory._id,
      quantity: 10,
      shipping: true,
      photo: {
        data: Buffer.from('test image data'),
        contentType: 'image/jpeg'
      }
    });
    productId = testProduct._id.toString();

    regularToken = JWT.sign({ _id: regularUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    
    adminToken = JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  });

  describe('Create Product Route', () => {
    test('Admin should create a product successfully', async () => {
      const response = await request(app)
        .post('/api/v1/product/create-product')
        .set('Authorization', adminToken)
        .field('name', 'New Product')
        .field('description', 'New product description')
        .field('price', '129.99')
        .field('category', testCategory._id.toString())
        .field('quantity', '5')
        .field('shipping', 'true')
        .attach('photo', testImagePath);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Product Created Successfully');
      expect(response.body.products).toHaveProperty('name', 'New Product');
    });

    test('Should not create product without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/product/create-product')
        .field('name', 'Unauthorized Product')
        .field('description', 'Description')
        .field('price', '99.99')
        .field('category', testCategory._id.toString())
        .field('quantity', '5');

      expect(response.statusCode).toBe(401);
    });

    test('Regular user should not create product', async () => {
      const response = await request(app)
        .post('/api/v1/product/create-product')
        .set('Authorization', regularToken)
        .field('name', 'Regular User Product')
        .field('description', 'Description')
        .field('price', '99.99')
        .field('category', testCategory._id.toString())
        .field('quantity', '5');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Update Product Route', () => {
    test('Admin should update a product successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/product/update-product/${productId}`)
        .set('Authorization', adminToken)
        .field('name', 'Updated Product')
        .field('description', 'Updated description')
        .field('price', '149.99')
        .field('category', testCategory._id.toString())
        .field('quantity', '15')
        .attach('photo', testImagePath);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Product Updated Successfully');
      expect(response.body.products).toHaveProperty('name', 'Updated Product');
    });

    test('Should not update product without authentication', async () => {
      const response = await request(app)
        .put(`/api/v1/product/update-product/${productId}`)
        .field('name', 'Unauthorized Update')
        .field('description', 'Description')
        .field('price', '99.99');

      expect(response.statusCode).toBe(401);
    });

    test('Regular user should not update product', async () => {
      const response = await request(app)
        .put(`/api/v1/product/update-product/${productId}`)
        .set('Authorization', regularToken)
        .field('name', 'Regular User Update')
        .field('description', 'Description')
        .field('price', '99.99');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Get Products Routes', () => {
    beforeEach(async () => {
      await productModel.create([
        {
          name: 'Smart TV',
          slug: slugify('Smart TV'),
          description: 'A smart television',
          price: 599.99,
          category: testCategory._id,
          quantity: 5,
          shipping: true
        },
        {
          name: 'Smartphone',
          slug: slugify('Smartphone'),
          description: 'A smartphone',
          price: 499.99,
          category: testCategory._id,
          quantity: 8,
          shipping: true
        }
      ]);
    });

    test('Should get all products', async () => {
      const response = await request(app)
        .get('/api/v1/product/get-product');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBe(3);
      expect(response.body.total).toBe(3);
    });

    test('Should get single product by slug', async () => {
      const response = await request(app)
        .get(`/api/v1/product/get-product/${testProduct.slug}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.product).toHaveProperty('name', testProduct.name);
    });

    test('Should get product photo', async () => {
      const response = await request(app)
        .get(`/api/v1/product/product-photo/${productId}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
    });

    test('Should handle product count', async () => {
      const response = await request(app)
        .get('/api/v1/product/product-count');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('total', 3);
    });

    test('Should handle product pagination', async () => {
      const response = await request(app)
        .get('/api/v1/product/product-list/1');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    test('Should search products by keyword', async () => {
      const response = await request(app)
        .get('/api/v1/product/search/Smart');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(2);
      expect(response.body.results[0].name).toBe('Smart TV');
    });

    test('Should get related products', async () => {
      const response = await request(app)
        .get(`/api/v1/product/related-product/${productId}/${testCategory._id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.every(p => p._id !== productId)).toBe(true);
    });

    test('Should get products by category', async () => {
      const response = await request(app)
        .get(`/api/v1/product/product-category/${testCategory.slug}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBe(3);
      expect(response.body.category.name).toBe('Electronics');
    });
  });

  describe('Filter Products Route', () => {
    test('Should filter products by price range', async () => {
      const response = await request(app)
        .post('/api/v1/product/product-filters')
        .send({
          checked: [],
          radio: [0, 500]
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.every(p => p.price <= 500)).toBe(true);
    });

    test('Should filter products by category', async () => {
      const response = await request(app)
        .post('/api/v1/product/product-filters')
        .send({
          checked: [testCategory._id.toString()],
          radio: []
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.every(p => 
        p.category.toString() === testCategory._id.toString()
      )).toBe(true);
    });
  });

  describe('Delete Product Route', () => {
    test('Should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/product/delete-product/${productId}`)
        .set('Authorization', adminToken);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Product Deleted successfully');

      const productExists = await productModel.findById(productId);
      expect(productExists).toBe(null);
    });

    test('Should handle non-existent product deletion', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .delete(`/api/v1/product/delete-product/${nonExistentId}`)
        .set('Authorization', adminToken);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Payment Routes', () => {
    test('Should get braintree token', async () => {
      const response = await request(app)
        .get('/api/v1/product/braintree/token');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('clientToken', 'mock-client-token');
    });

    test('Should process payment successfully', async () => {
      const paymentData = {
        cart: [
          {
            _id: productId,
            name: 'Test Product',
            price: 99.99,
            quantity: 2
          }
        ],
        nonce: 'fake-valid-nonce',
        cartTotal: 199.98
      };

      const response = await request(app)
        .post('/api/v1/product/braintree/payment')
        .set('Authorization', regularToken)
        .send(paymentData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('Should require authentication for payment processing', async () => {
      const paymentData = {
        cart: [
          {
            _id: productId,
            name: 'Test Product',
            price: 99.99,
            quantity: 1
          }
        ],
        nonce: 'fake-valid-nonce'
      };

      const response = await request(app)
        .post('/api/v1/product/braintree/payment')
        .send(paymentData);

      expect(response.statusCode).toBe(401);
    });
  });
});