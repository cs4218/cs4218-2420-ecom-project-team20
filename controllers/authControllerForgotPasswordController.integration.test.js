import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { registerController, loginController } from "./authController";
import { jest } from "@jest/globals";
import UserModel from "../models/userModel";
import { forgotPasswordController } from "./authController";
import JWT from "jsonwebtoken";

let mongoServer;

const userProfile = {
  name: "John Doe",
  email: "johndoe@test.com",
  password: "johndoe@test.com",
  phone: "1234567890",
  address: "123 Street",
  dob: "1990-01-01",
  answer: "Football",
};

describe("authController forgotPasswordController integration tests", () => {
  let registerReq,
    registerRes,
    forgotPasswordReq,
    forgotPasswordRes,
    loginReq,
    loginRes;

  registerReq = {
    body: userProfile,
  };

  registerRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  forgotPasswordReq = {
    body: {
      email: "johndoe@test.com",
      answer: "Football",
      newPassword: "newpassword123",
    },
  };

  forgotPasswordRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  loginReq = {
    body: { email: "johndoe@test.com", password: "newpassword123" },
  };

  loginRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    jest.spyOn(JWT, "sign").mockReturnValue("mocked-jwt-token");
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should register a user and allow user to change password and login again", async () => {
    await registerController(registerReq, registerRes);

    expect(registerRes.status).toHaveBeenCalledWith(201);
    expect(registerRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({
          email: expect.any(String),
        }),
      })
    );

    const user = await UserModel.findOne({ email: userProfile.email });
    expect(user).not.toBeNull();

    await forgotPasswordController(forgotPasswordReq, forgotPasswordRes);

    expect(forgotPasswordRes.status).toHaveBeenCalledWith(200);
    expect(forgotPasswordRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Password reset successfully",
      })
    );

    await loginController(loginReq, loginRes);
    expect(loginRes.status).toHaveBeenCalledWith(200);
    expect(loginRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Logged in successfully",
        user: expect.objectContaining({
          email: loginReq.body.email,
        }),
      })
    );
  });

  it("should not reset password if the security answer is incorrect", async () => {
    await registerController(registerReq, registerRes);

    const wrongAnswerReq = {
      body: {
        email: userProfile.email,
        answer: "WrongAnswer",
        newPassword: "newpassword123",
      },
    };
    await forgotPasswordController(wrongAnswerReq, forgotPasswordRes);

    expect(forgotPasswordRes.status).toHaveBeenCalledWith(404);
    expect(forgotPasswordRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Wrong email or answer",
      })
    );
  });

  it("should not reset password for a non-existent user", async () => {
    const nonExistentForgotReq = {
      body: {
        email: "notregistered@test.com",
        answer: "Football",
        newPassword: "newpassword123",
      },
    };

    await forgotPasswordController(nonExistentForgotReq, forgotPasswordRes);

    expect(forgotPasswordRes.status).toHaveBeenCalledWith(404);
    expect(forgotPasswordRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Wrong email or answer",
      })
    );
  });
});
