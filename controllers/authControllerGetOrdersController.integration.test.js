import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UserModel from "../models/userModel";
import CategoryModel from "../models/categoryModel";
import ProductModel from "../models/productModel";
import OrderModel from "../models/orderModel";
import { getOrdersController } from "./authController";
import { jest } from "@jest/globals";

let mongoServer;

const userProfile = new UserModel({
  name: "John Doe",
  email: "johndoe@test.com",
  password: "johndoe@test.com",
  phone: "1234567890",
  address: "123 Street",
  dob: "1990-01-01",
  answer: "Football",
});

const category = new CategoryModel({
  name: "Electronics",
  slug: "electronics",
});

const product = new ProductModel({
  name: "Test Laptop",
  slug: "test-laptop",
  description: "A high-performance test laptop",
  price: 999.99,
  category: category._id,
  quantity: 10,
  shipping: true,
});

const order = new OrderModel({
  products: [product._id],
  payment: { method: "Credit Card", amount: 99.99 },
  buyer: userProfile._id,
  status: "Processing",
});

describe("authController getOrdersController integration tests", () => {
  let req, res;
  req = {
    user: { _id: userProfile._id },
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await mongoose.connection.createCollection("users");
    await mongoose.connection.createCollection("categories");
    await mongoose.connection.createCollection("products");
    await mongoose.connection.createCollection("orders");
    await userProfile.save();
    await category.save();
    await product.save();
    await order.save();
  });

  afterEach(async () => {
    await mongoose.connection.dropCollection("users");
    await mongoose.connection.dropCollection("categories");
    await mongoose.connection.dropCollection("products");
    await mongoose.connection.dropCollection("orders");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should successfully show the correct user's orders", async () => {
    await getOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.orders).toBeInstanceOf(Array);
    expect(responseData.orders.length).toBe(1);

    const firstOrder = responseData.orders[0];
    expect(firstOrder).toHaveProperty("buyer.name", "John Doe");
    expect(firstOrder).toHaveProperty("status", "Processing");
  });
});
