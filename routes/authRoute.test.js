import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import authRoutes from './authRoute.js';
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';
import { hashPassword } from '../helpers/authHelper.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  let mongoServer;
  let regularUser;
  let adminUser;
  let regularToken;
  let adminToken;
  let orderId;
  let testProduct;
  let testCategory

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
    await categoryModel.deleteMany({});
    await productModel.deleteMany({});
    await orderModel.deleteMany({});

    testCategory = await mongoose.model("Category").create({
        name: "Electronics",
      });
    
    testProduct = await mongoose.model("Products").create({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        category: testCategory._id,
        quantity: 10,
        shipping: false,
      });

    regularUser = await userModel.create({
      name: 'Regular User',
      email: 'regular@test.com',
      password: await hashPassword("password123"), // hashed "password123"
      phone: '1234567890',
      address: 'Test Address',
      role: 0,
      answer: 'test'
    });

    adminUser = await userModel.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: await hashPassword("password123"),
      phone: '0987654321',
      address: 'Admin Address',
      role: 1,
      answer: 'test'
    });

    const order = await orderModel.create({
      products: [testProduct._id],
      payment: {},
      buyer: regularUser._id,
      status: 'Not Process'
    });
    orderId = order._id;

    regularToken = JWT.sign({ _id: regularUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    
    adminToken = JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  });

  describe('Authentication Endpoints', () => {
    test('Should register a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@test.com',
        password: 'newpassword123',
        phone: '5555555555',
        address: 'New Address',
        answer: 'test'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('name', newUser.name);
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).not.toHaveProperty('password', newUser.password);
    });

    test('Should not register user with existing email', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: 'regular@test.com',
        password: 'password123',
        phone: '1111111111',
        address: 'Duplicate Address',
        answer: 'test'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(duplicateUser);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch("Already registered, please login");
    });

    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'regular@test.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logged in successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    test('Should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'regular@test.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/invalid password/i);
    });

    test('Should reset password with valid details', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'regular@test.com',
          newPassword: 'newpassword123',
          answer: 'test'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Protected Routes', () => {
    test('Should allow authorized user access to user-auth endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/auth/user-auth')
        .set('Authorization', regularToken);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
    });

    test('Should deny unauthorized access to user-auth endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/auth/user-auth');

      expect(response.statusCode).toBe(401);
    });

    test('Should allow admin access to admin-auth endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/auth/admin-auth')
        .set('Authorization', adminToken);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
    });

    test('Should deny regular user access to admin-auth endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/auth/admin-auth')
        .set('Authorization', regularToken);

      expect(response.statusCode).toBe(401);
    });

    test('Should update user profile for authenticated user', async () => {
      const updatedProfile = {
        name: 'Updated Name',
        email: 'updated@test.com',
        password: 'updatedpassword',
        address: 'Updated Address',
        phone: '9999999999'
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', regularToken)
        .send(updatedProfile);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.updatedUser).toHaveProperty('name', updatedProfile.name);
      expect(response.body.updatedUser).toHaveProperty('email', updatedProfile.email);
    });
  });

  describe('Order Management Routes', () => {
    test('Should get user orders for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/auth/orders')
        .set('Authorization', regularToken);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    test('Should get all orders for admin', async () => {
      const response = await request(app)
        .get('/api/v1/auth/all-orders')
        .set('Authorization', adminToken);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    test('Should deny regular user access to all-orders endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/auth/all-orders')
        .set('Authorization', regularToken);

      expect(response.statusCode).toBe(401);
    });

    test('Should update order status as admin', async () => {
      const response = await request(app)
        .put(`/api/v1/auth/order-status/${orderId}`)
        .set('Authorization', adminToken)
        .send({ status: 'Processing' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      
      const updatedOrder = await orderModel.findById(orderId);
      expect(updatedOrder.status).toBe('Processing');
    });

    test('Should deny order status update to regular user', async () => {
      const response = await request(app)
        .put(`/api/v1/auth/order-status/${orderId}`)
        .set('Authorization', regularToken)
        .send({ status: 'Processing' });

      expect(response.statusCode).toBe(401);
      
      const order = await orderModel.findById(orderId);
      expect(order.status).toBe('Not Process');
    });
  });

  describe('Test Route', () => {
    test('Should allow admin access to test endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/auth/test')
        .set('Authorization', adminToken);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    test('Should deny regular user access to test endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/auth/test')
        .set('Authorization', regularToken);

      expect(response.statusCode).toBe(401);
    });
  });
});