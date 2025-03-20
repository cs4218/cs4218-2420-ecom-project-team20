export default {
  displayName: "backend",

  testEnvironment: "node",
<<<<<<< HEAD
  testMatch: [
    "<rootDir>/*/*.test.js",
  ],
  collectCoverage: false,
=======
  testMatch: ["<rootDir>/*/*.test.js", "<rootDir>/*/*.integration.test.js"],
  collectCoverage: true,
>>>>>>> parent of 6f477a1 (test: add ui and integration test)
  collectCoverageFrom: ["<rootDir>/*/*.js"],
  coverageThreshold: {
    global: {
      lines: 10,
      functions: 10,
    },
  },
};
