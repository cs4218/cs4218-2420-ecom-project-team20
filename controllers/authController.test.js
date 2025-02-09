import { expect, jest } from "@jest/globals";
import { registerController } from "./authController.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import { hashPassword } from "../helpers/authHelper.js";

jest.mock("../models/userModel.js", () => {
  const mockConstructor = jest.fn().mockImplementation(function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });
  mockConstructor.findOne = jest.fn();
  mockConstructor.create = jest.fn();
  mockConstructor.save = jest.fn();
  return mockConstructor;
});

jest.mock("mongoose", () => ({
  models: {},
  model: jest.fn(),
  Schema: jest.fn(),
  connect: jest.fn(),
  connection: { close: jest.fn() },
}));

jest.mock("../helpers/authHelper.js", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashedPassword123"),
}));

describe("Register Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

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

  test("user model is not saved for invalid email", async () => {
    req.body.email = "invalid-email";
    userModel.findOne.mockResolvedValue(null);

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(userModel.create).not.toHaveBeenCalled();
  });

  test("user registration succeeds with a valid email", async () => {
    userModel.findOne.mockResolvedValue(null);

    userModel.create.mockResolvedValue({
      _id: "12345",
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      password: "hashedPassword123",
      answer: req.body.answer,
    });

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
      message: "User Register Successfully",
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
      message: "Already Register please login",
    });
    expect(userModel.save).not.toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.resetModules();
  });
});
