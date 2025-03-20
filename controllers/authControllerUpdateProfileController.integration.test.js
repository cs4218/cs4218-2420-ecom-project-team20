import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UserModel from "../models/userModel";
import { updateProfileController } from "./authController";
import { jest } from "@jest/globals";

let mongoServer;

const userProfile = new UserModel({
  name: "John Doe",
  email: "johndoe@test.com",
  password: "johndoe@test.com",
  phone: "1234567890",
  address: "123 Street",
  dob: "1990-01-01",
  answer: "Football",
});

describe("authController loginController and updateProfileController integration tests", () => {
  let req, res;

  req = {
    user: { _id: userProfile._id },
    body: {
      name: "Jane Dolly",
      email: "janedolly@test.com",
      password: "janedolly@test.com",
      phone: "0987654321",
      address: "543 Street",
      dob: "1995-10-10",
    },
  };

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
    await userProfile.save();
  });

  afterEach(async () => {
    await mongoose.connection.dropCollection("users");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should successfully update profile of an existing user", async () => {
    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Profile updated successfully",
        updatedUser: expect.any(Object),
      })
    );
  });
});
