import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { registerController } from "./authController";
import userModel from "../models/userModel";

jest.mock("../models/userModel.js", () => ({
  findOne: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
}));

jest.mock("mongoose", () => ({
  models: {},
  model: jest.fn(),
  Schema: jest.fn(),
  connect: jest.fn(),
  connection: { close: jest.fn() },
}));

describe("Register Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    req = {
      body: {
        name: "John Doe",
        email: "invalid-email",
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
    userModel.findOne.mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);

    expect(userModel.prototype.save).not.toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.resetModules();
  });
});
