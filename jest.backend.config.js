export default {
  displayName: "backend",

  testEnvironment: "node",
  testMatch: [
    "<rootDir>/controllers/authControllerOrderStatusController.integration.test.js",
  ],
  collectCoverage: false,
  collectCoverageFrom: ["<rootDir>/*/*.js"],
  coverageThreshold: {
    global: {
      lines: 10,
      functions: 10,
    },
  },
};
