import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import { requireSignIn, isAdmin } from './authMiddleware.js';
import userModel from '../models/userModel.js';

dotenv.config();

// Set JWT_SECRET for testing
process.env.JWT_SECRET = "test_jwt";

// Setup express app for testing middleware
const app = express();
app.use(express.json());

// Create test routes that use the middleware
app.get('/api/test/protected', requireSignIn, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

app.get('/api/test/admin', requireSignIn, isAdmin, (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
});

describe('Auth Middleware Integration Tests', () => {
  let mongoServer;
  let regularUser;
  let adminUser;
  let regularToken;
  let adminToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    regularUser = new userModel({
      name: 'Regular User',
      email: 'regular@test.com',
      password: 'password123',
      phone: '1234567890',
      address: 'Test Address',
      role: 0,
      answer: 'test answer',
    });
    await regularUser.save();

    adminUser = new userModel({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      phone: '0987654321',
      address: 'Admin Address',
      role: 1,
      answer: 'test answer',
    });
    await adminUser.save();

    // Generate tokens for test users
    regularToken = JWT.sign({ _id: regularUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    
    adminToken = JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('requireSignIn Middleware', () => {
    test('Should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', regularToken);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('_id', regularUser._id.toString());
    });

    test('Should deny access without token', async () => {
      const response = await request(app)
        .get('/api/test/protected');
      
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication token required');
    });

    test('Should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'invalid-token');
      
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication failed');
      expect(response.body.error).toBe('jwt malformed');
    });
  });

  describe('isAdmin Middleware', () => {
    test('Should allow access for admin users', async () => {
      const response = await request(app)
        .get('/api/test/admin')
        .set('Authorization', adminToken);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin access granted');
    });

    test('Should deny access for non-admin users', async () => {
      const response = await request(app)
        .get('/api/test/admin')
        .set('Authorization', regularToken);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('UnAuthorized Access');
    });

    test('Should handle errors when user not found', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId().toString();
      const invalidToken = JWT.sign({ _id: nonExistentUserId }, process.env.JWT_SECRET);
      
      const response = await request(app)
        .get('/api/test/admin')
        .set('Authorization', invalidToken);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });
});