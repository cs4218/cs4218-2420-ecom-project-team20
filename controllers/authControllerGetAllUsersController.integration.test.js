import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UserModel from "../models/userModel";
import { getAllUsersController } from "./authController";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware";
import { jest } from "@jest/globals";
import JWT from "jsonwebtoken";
import { expect } from "playwright/test";

let mongoServer;
process.env.JWT_SECRET = "test_jwt";

describe("authController getAllUsersController integration tests", () => {
  let req, res, next, userProfile1, userProfile2, adminUser, authToken;

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
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should successfully show all users on the admin's dashboard", async () => {
    req.headers = {
      authorization: authToken,
    };

    await requireSignIn(req, res, next);
    await isAdmin(req, res, next);
    const users = await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    let responseData = res.json.mock.calls[0][0];
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.users).toBeInstanceOf(Array);
    expect(responseData.users.length).toBe(3);

    const userIds = responseData.users.map((user) => user._id.toString());
    expect(userIds).toContain(userProfile1._id.toString());
    expect(userIds).toContain(userProfile2._id.toString());
    expect(userIds).toContain(adminUser._id.toString());
  });

  it("should return an empty list when there are no users", async () => {
    req.headers = {
      authorization: authToken,
    };
    await mongoose.connection.dropCollection("users");

    const next = jest.fn();

    await requireSignIn(req, res, next);
    await isAdmin(req, res, next);
    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.users).toEqual([]);
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
