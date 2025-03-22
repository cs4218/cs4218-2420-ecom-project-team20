import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UserModel from "../models/userModel";
import CategoryModel from "../models/categoryModel";
import ProductModel from "../models/productModel";
import OrderModel from "../models/orderModel";
import { getAllOrdersController } from "./authController";
import { jest } from "@jest/globals";

let mongoServer;

const userProfile1 = new UserModel({
  name: "John Doe",
  email: "johndoe@test.com",
  password: "johndoe@test.com",
  phone: "1234567890",
  address: "123 Street",
  dob: "1990-01-01",
  answer: "Football",
});

const userProfile2 = new UserModel({
  name: "Jane Dolly",
  email: "janedolly@test.com",
  password: "janedolly@test.com",
  phone: "0987654321",
  address: "321 Street",
  dob: "1995-10-10",
  answer: "Badminton",
});

const category = new CategoryModel({
  name: "Electronics",
  slug: "electronics",
});

const product1 = new ProductModel({
  name: "Test Laptop",
  slug: "test-laptop",
  description: "A high-performance test laptop",
  price: 999.99,
  category: category._id,
  quantity: 10,
  shipping: true,
});

const product2 = new ProductModel({
  name: "Test Phone",
  slug: "test-phone",
  description: "A high-performance test phone",
  price: 1000.99,
  category: category._id,
  quantity: 20,
  shipping: true,
});

const order1 = new OrderModel({
  products: [product1._id],
  payment: { method: "Credit Card", amount: 999.99 },
  buyer: userProfile1._id,
  status: "Processing",
});

const order2 = new OrderModel({
  products: [product2._id],
  payment: { method: "Credit Card", amount: 1000.99 },
  buyer: userProfile2._id,
  status: "Processing",
});

describe("authController getAllOrdersController integration tests", () => {
  let req, res;
  req = {};

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
    await userProfile1.save();
    await userProfile2.save();
    await category.save();
    await product1.save();
    await product2.save();
    await order1.save();
    await order2.save();
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

  it("should successfully show all the orders on the admin's dashboard", async () => {
    await getAllOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    let responseData = res.json.mock.calls[0][0];
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.orders).toBeInstanceOf(Array);
    expect(responseData.orders.length).toBe(2);

    const firstOrder = responseData.orders[0];
    expect(firstOrder).toHaveProperty("buyer.name", "Jane Dolly");
    expect(firstOrder).toHaveProperty("status", "Processing");

    const secondOrder = responseData.orders[1];
    expect(secondOrder).toHaveProperty("buyer.name", "John Doe");
    expect(secondOrder).toHaveProperty("status", "Processing");
  });
});
