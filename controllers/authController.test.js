import { expect, jest } from "@jest/globals";
import {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "./authController.js";

import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";

jest.mock("../models/userModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.findOne = jest.fn();
  mockConstructor.findById = jest.fn();
  mockConstructor.findByIdAndUpdate = jest.fn();
  mockConstructor.create = jest.fn();
  return mockConstructor;
});

jest.mock("../models/orderModel.js", () => ({
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("mongoose", () => ({
  models: {},
  model: jest.fn(),
  Schema: jest.fn(),
  connect: jest.fn(),
  connection: { close: jest.fn() },
}));

jest.mock("../helpers/authHelper.js", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashedPassword123"),
  comparePassword: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("token123"),
}));

describe("Register Controller Test", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "John Doe",
        email: "valid@example.com",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
        answer: "Football",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should return 400 for invalid email", async () => {
    req.body.email = "invalid-email";
    userModel.findOne.mockResolvedValue(null);
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email",
    });
  });

  test("should return error when name is missing", async () => {
    req.body.name = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is required" });
  });

  test("should return error when email is missing", async () => {
    req.body.email = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
  });

  test("should return error when password is missing", async () => {
    req.body.password = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is required" });
  });

  test("should return error when phone is missing", async () => {
    req.body.phone = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({
      message: "Phone number is required",
    });
  });

  test("should return error when address is missing", async () => {
    req.body.address = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Address is required" });
  });

  test("should return error when answer is missing", async () => {
    req.body.answer = "";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is required" });
  });

  test("should register user successfully with valid details", async () => {
    userModel.findOne.mockResolvedValue(null);
    await registerController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(userModel).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        password: "hashedPassword123",
        answer: req.body.answer,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User registered successfully",
      user: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        password: "hashedPassword123",
        answer: req.body.answer,
      },
    });
  });

  test("user registration fails if email is already registered", async () => {
    userModel.findOne.mockResolvedValue({ email: req.body.email });
    await registerController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already registered, please login",
    });
  });

  test("should catch exception in registerController", async () => {
    req.body.email = "valid@example.com";
    userModel.findOne.mockRejectedValue(new Error("DB error"));
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in registration",
      error: expect.any(Error),
    });
  });
});

describe("Login Controller Test", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: { email: "user@example.com", password: "password123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should return 404 if email or password is missing", async () => {
    req.body.email = "";
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("should return 404 if user is not found", async () => {
    req.body.email = "nonexistent@example.com";
    userModel.findOne.mockResolvedValue(null);
    await loginController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registered",
    });
  });

  test("should return 401 with invalid password message if password does not match", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: req.body.email,
      password: "hashedPassword",
      phone: "1234567890",
      address: "123 Street",
      role: "user",
    };
    userModel.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(false);
    await loginController(req, res);
    expect(comparePassword).toHaveBeenCalledWith(
      req.body.password,
      mockUser.password
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  test("should return 200 with token and user info on successful login", async () => {
    const mockUser = {
      _id: "user123",
      name: "John Doe",
      email: req.body.email,
      password: "hashedPassword",
      phone: "1234567890",
      address: "123 Street",
      role: "user",
    };
    userModel.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    await loginController(req, res);
    expect(comparePassword).toHaveBeenCalledWith(
      req.body.password,
      mockUser.password
    );
    expect(JWT.sign).toHaveBeenCalledWith(
      { _id: mockUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        role: mockUser.role,
      },
      token: "token123",
    });
  });

  test("should catch exception in loginController", async () => {
    userModel.findOne.mockRejectedValue(new Error("DB error"));
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error: expect.any(Error),
    });
  });
});

describe("Forgot Password Controller Test", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "user@example.com",
        answer: "correctAnswer",
        newPassword: "newpassword123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should return 400 if email is missing", async () => {
    req.body.email = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
  });

  test("should return 400 if answer is missing", async () => {
    req.body.answer = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is required" });
  });

  test("should return 400 if newPassword is missing", async () => {
    req.body.newPassword = "";
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "New password is required",
    });
  });

  test("should return 404 if user with email and answer is not found", async () => {
    userModel.findOne.mockResolvedValue(null);
    await forgotPasswordController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: req.body.email,
      answer: req.body.answer,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong email or answer",
    });
  });

  test("should reset password successfully", async () => {
    const mockUser = { _id: "user123" };
    userModel.findOne.mockResolvedValue(mockUser);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
    await forgotPasswordController(req, res);
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: req.body.email,
      answer: req.body.answer,
    });
    expect(hashPassword).toHaveBeenCalledWith(req.body.newPassword);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
      password: "hashedPassword123",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password reset successfully",
    });
  });

  test("should catch exception in forgotPasswordController", async () => {
    userModel.findOne.mockRejectedValue(new Error("DB error"));
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error: expect.any(Error),
    });
  });
});

describe("Test Controller", () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = {
      send: jest.fn().mockReturnThis(),
    };
  });

  test("should send Protected Routes", () => {
    testController(req, res);
    expect(res.send).toHaveBeenCalledWith({
      message: "Protected Routes",
      success: true,
    });
  });
});

describe("Update Profile Controller", () => {
  let req, res, mockUser;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "Updated Name",
        email: "updated@example.com",
        password: "newpassword123",
        address: "New Address",
        phone: "9876543210",
      },
      user: { _id: "user123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockUser = {
      _id: "user123",
      name: "Old Name",
      password: "oldhashed",
      phone: "1234567890",
      address: "Old Address",
    };
    userModel.findById.mockResolvedValue(mockUser);
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      _id: "user123",
      name: req.body.name,
      password: "hashedPassword123",
      phone: req.body.phone,
      address: req.body.address,
    });
  });

  test("should return error if password is provided and is less than 6 characters", async () => {
    req.body.password = "123";
    await updateProfileController(req, res);
    expect(res.json).toHaveBeenCalledWith({
      error: "Password must be at least 6 characters long",
    });
  });

  test("should update profile successfully with provided details", async () => {
    await updateProfileController(req, res);
    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: req.body.name,
        password: "hashedPassword123",
        phone: req.body.phone,
        address: req.body.address,
        email: req.body.email,
      },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile updated successfully",
      updatedUser: {
        _id: "user123",
        name: req.body.name,
        password: "hashedPassword123",
        phone: req.body.phone,
        address: req.body.address,
      },
    });
  });

  test("should update profile successfully without password change", async () => {
    delete req.body.password;
    await updateProfileController(req, res);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: req.body.name,
        email: req.body.email,
        password: mockUser.password,
        phone: req.body.phone,
        address: req.body.address,
      },
      { new: true }
    );
  });

  test("should catch exception in updateProfileController", async () => {
    userModel.findById.mockRejectedValue(new Error("DB error"));
    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while updating profile",
      error: expect.any(Error),
    });
  });
});

describe("Get Orders Controller", () => {
  let req, res;
  const ordersArray = [{ orderId: "order1" }, { orderId: "order2" }];
  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { _id: "user123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should return orders for buyer", async () => {
    jest.spyOn(userModel, "findById").mockResolvedValue({ _id: req.user._id });
    const mockPopulateSecond = jest.fn().mockResolvedValue(ordersArray);
    const mockPopulateFirst = jest.fn(() => ({ populate: mockPopulateSecond }));
    orderModel.find.mockReturnValue({ populate: mockPopulateFirst });
    await getOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
    expect(res.json).toHaveBeenCalledWith({
      orders: ordersArray,
      success: true,
    });
  });

  test("should handle error while getting orders", async () => {
    orderModel.find.mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      })),
    }));
    await getOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting orders",
      error: expect.any(Error),
    });
  });
});

describe("Get All Orders Controller", () => {
  let req, res;
  const ordersArray = [{ orderId: "order1" }, { orderId: "order2" }];
  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should return all orders", async () => {
    const mockSort = jest.fn().mockResolvedValue(ordersArray);
    const mockPopulateSecond = jest.fn(() => ({ sort: mockSort }));
    const mockPopulateFirst = jest.fn(() => ({ populate: mockPopulateSecond }));
    orderModel.find.mockReturnValue({ populate: mockPopulateFirst });
    await getAllOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      orders: ordersArray,
    });
  });

  test("should handle error while getting all orders", async () => {
    orderModel.find.mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          sort: jest.fn().mockRejectedValue(new Error("DB error")),
        })),
      })),
    }));
    await getAllOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting orders",
      error: expect.any(Error),
    });
  });
});

describe("Order Status Controller", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { orderId: "order123" }, body: { status: "Delivered" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should update order status successfully", async () => {
    const updatedOrder = { _id: "order123", status: "Delivered" };
    orderModel.findByIdAndUpdate.mockResolvedValue(updatedOrder);
    await orderStatusController(req, res);
    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.orderId,
      { status: req.body.status },
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, updatedOrder });
  });

  test("should handle error while updating order status", async () => {
    orderModel.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));
    await orderStatusController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while updating order",
      error: expect.any(Error),
    });
  });
});
