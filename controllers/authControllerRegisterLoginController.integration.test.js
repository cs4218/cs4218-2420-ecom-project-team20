import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { registerController, loginController } from "./authController";
import { jest } from "@jest/globals";
import JWT from "jsonwebtoken";
import UserModel from "../models/userModel";

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

describe("authController loginController and registerController integration tests", () => {
  let registerReq, registerRes, loginReq, loginRes;

  registerReq = {
    body: userProfile,
  };

  registerRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  loginReq = {
    body: {
      email: "johndoe@test.com",
      password: "johndoe@test.com",
    },
  };

  loginRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await mongoose.connection.createCollection("users");
    jest.spyOn(JWT, "sign").mockReturnValue("mocked-jwt-token");
  });

  afterEach(async () => {
    await mongoose.connection.dropCollection("users");
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should register and login a user successfully", async () => {
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
});
