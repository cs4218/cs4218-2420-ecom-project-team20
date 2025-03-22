import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UserModel from "../models/userModel";
import CategoryModel from "../models/categoryModel";
import ProductModel from "../models/productModel";
import OrderModel from "../models/orderModel";
import { getAllOrdersController } from "./authController";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware";
import { jest } from "@jest/globals";
import JWT from "jsonwebtoken";

let mongoServer;
process.env.JWT_SECRET = "test_jwt";

describe("authController getAllOrdersController integration tests", () => {
  let req,
    res,
    next,
    userProfile1,
    userProfile2,
    adminUser,
    category,
    product1,
    product2,
    order1,
    order2,
    authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    userProfile1 = await new UserModel({
      name: "John Doe",
      email: "johndoe@test.com",
      password: "johndoe@test.com",
      phone: "1234567890",
      address: "123 Street",
      dob: "1990-01-01",
      answer: "Football",
      role: 0,
    }).save();

    userProfile2 = await new UserModel({
      name: "Jane Dolly",
      email: "janedolly@test.com",
      password: "janedolly@test.com",
      phone: "0987654321",
      address: "321 Street",
      dob: "1995-10-10",
      answer: "Badminton",
      role: 0,
    }).save();

    adminUser = await new UserModel({
      name: "Admin User",
      email: "admin@test.com",
      password: "admin@test.com",
      phone: "1112223333",
      address: "Admin Street",
      dob: "1985-05-05",
      role: 1,
      answer: "Frisbee",
    }).save();

    authToken = JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    category = await new CategoryModel({
      name: "Electronics",
      slug: "electronics",
    }).save();

    product1 = await new ProductModel({
      name: "Test Laptop",
      slug: "test-laptop",
      description: "A high-performance test laptop",
      price: 999.99,
      category: category._id,
      quantity: 10,
      shipping: true,
    }).save();

    product2 = await new ProductModel({
      name: "Test Phone",
      slug: "test-phone",
      description: "A high-performance test phone",
      price: 1000.99,
      category: category._id,
      quantity: 20,
      shipping: true,
    }).save();

    order1 = await new OrderModel({
      products: [product1._id],
      payment: { method: "Credit Card", amount: 999.99 },
      buyer: userProfile1._id,
      status: "Processing",
    }).save();

    order2 = await new OrderModel({
      products: [product2._id],
      payment: { method: "Credit Card", amount: 1000.99 },
      buyer: userProfile2._id,
      status: "Processing",
    }).save();

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    next = jest.fn();
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

  it("should successfully show all the orders on the admin's dashboard", async () => {
    req.headers = {
      authorization: authToken,
    };

    await requireSignIn(req, res, next);
    await isAdmin(req, res, next);
    await getAllOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    let responseData = res.json.mock.calls[0][0];
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.orders).toBeInstanceOf(Array);
    expect(responseData.orders.length).toBe(2);

    const orderIds = responseData.orders.map((order) => order._id.toString());
    expect(orderIds).toContain(order1._id.toString());
    expect(orderIds).toContain(order2._id.toString());
  });

  it("should return an empty list when there are no orders", async () => {
    req.headers = {
      authorization: authToken,
    };
    await mongoose.connection.dropCollection("orders");

    const next = jest.fn();

    await requireSignIn(req, res, next);
    await isAdmin(req, res, next);
    await getAllOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.orders).toEqual([]);
  });

  it("should return 401 Unauthorized if the user is not an admin", async () => {
    req.headers = {
      authorization: JWT.sign(
        { _id: userProfile1._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      ),
    };
    const next = jest.fn();

    await requireSignIn(req, res, next);
    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "UnAuthorized Access",
      })
    );
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
