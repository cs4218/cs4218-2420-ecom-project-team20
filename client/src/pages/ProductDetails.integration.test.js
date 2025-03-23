import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

import ProductModel from "../../../models/productModel";
import CategoryModel from "../../../models/categoryModel";
import * as productController from "../../../controllers/productController";

dotenv.config();
let mongoServer;
const app = express();
app.use(express.json());
app.get("/api/v1/product/get-product/:slug", productController.getSingleProductController);
app.get("/api/v1/product/related-product/:pid/:cid", productController.realtedProductController);

jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn(() => {
    return {
      clientToken: {
        generate: jest.fn(),
      },
      transaction: {
        sale: jest.fn(),
      },
    };
  }),
  Environment: {
    Sandbox: "sandbox",
  },
}));

const mockProduct = {
  _id: "66db427fdb0119d9234b27f1",
  name: "Textbook",
  slug: "textbook",
  description: "A comprehensive textbook",
  price: 79.99,
  category: new mongoose.Types.ObjectId("67daefb0e430f9c760210709"),
  quantity: 50,
  shipping: false,
};
const mockSimilarProduct = {
  _id: "67a2171ea6d9e00ef2ac0229",
  name: "The Law of Contract in Singapore",
  slug: "the-law-of-contract-in-singapore",
  description: "A bestselling book in Singapore",
  price: 54.99,
  category: new mongoose.Types.ObjectId("67daefb0e430f9c760210709"),
  quantity: 200,
  shipping: true,
};
const mockCategory = {
  name: "book",
  slug: "book",
  _id: "67daefb0e430f9c760210709",
};

describe("ProductDetails Integration Tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    const bookCategory = await new CategoryModel(mockCategory);
    const product = await new ProductModel(mockProduct);
    const similarProduct = await new ProductModel(mockSimilarProduct);
    await bookCategory.save();
    await product.save();
    await similarProduct.save();
  });

  afterEach(async () => {
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("get product details", () => {
    it("should return 200 and the existing product", async () => {
      const response = await request(app).get(`/api/v1/product/get-product/${ mockProduct.slug }`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Single Product Fetched");
      expect(response.body.product.name).toBe(mockProduct.name);
    });

    it("should return 404 when the product doesn't exist", async () => {
      const response = await request(app).get("/api/v1/product/get-product/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Product not found");
    });
  });

  describe("get similar product details", () => {
    it("should return 200 and the similar product", async () => {
      const response = await request(app)
        .get(`/api/v1/product/related-product/${ mockProduct._id }/${ mockCategory._id }`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toEqual(1);
      expect(response.body.products[0].name).toEqual(mockSimilarProduct.name);
    });
  });
});
