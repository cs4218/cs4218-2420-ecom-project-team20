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

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
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

  it("should not register a user with an existing email", async () => {
    await registerController(registerReq, registerRes);
    await registerController(registerReq, registerRes);

    expect(registerRes.status).toHaveBeenCalledWith(200);
    expect(registerRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Already registered, please login",
      })
    );
  });

  it("should hash the password before saving to the database", async () => {
    await registerController(registerReq, registerRes);

    const user = await UserModel.findOne({ email: userProfile.email });

    expect(user).not.toBeNull();
    expect(user.password).not.toBe(userProfile.password); // Ensure password is hashed
  });

  it("should not log in a non-existent user", async () => {
    await loginController(loginReq, loginRes);

    expect(loginRes.status).toHaveBeenCalledWith(404);
    expect(loginRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Email is not registered",
      })
    );
  });

  it("should not log in with an incorrect password", async () => {
    await registerController(registerReq, registerRes);

    loginReq.body.password = "wrongpassword";

    await loginController(loginReq, loginRes);

    expect(loginRes.status).toHaveBeenCalledWith(401);
    expect(loginRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid Password",
      })
    );
  });
});
