import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UserModel from "../models/userModel";
import CategoryModel from "../models/categoryModel";
import ProductModel from "../models/productModel";
import OrderModel from "../models/orderModel";
import { getOrdersController } from "./authController";
import { jest } from "@jest/globals";

let mongoServer;

describe("authController getOrdersController integration tests", () => {
  let req, res, userProfile, category, product, order;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    userProfile = await new UserModel({
      name: "John Doe",
      email: "johndoe@test.com",
      password: "johndoe@test.com",
      phone: "1234567890",
      address: "123 Street",
      dob: "1990-01-01",
      answer: "Football",
    }).save();

    category = await new CategoryModel({
      name: "Electronics",
      slug: "electronics",
    }).save();

    product = await new ProductModel({
      name: "Test Laptop",
      slug: "test-laptop",
      description: "A high-performance test laptop",
      price: 999.99,
      category: category._id,
      quantity: 10,
      shipping: true,
    }).save();

    order = await new OrderModel({
      products: [product._id],
      payment: { method: "Credit Card", amount: 99.99 },
      buyer: userProfile._id,
      status: "Processing",
    }).save();

    req = {
      user: { _id: userProfile._id },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
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

  it("should return an empty array if the user has no orders", async () => {
    await OrderModel.deleteMany({ buyer: userProfile._id });

    await getOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.orders).toEqual([]);
  });

  it("should return an error if the user does not exist", async () => {
    req.user._id = new mongoose.Types.ObjectId();

    await getOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User not found",
      })
    );
  });
});
