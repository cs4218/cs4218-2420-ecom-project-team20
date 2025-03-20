export default {
  displayName: "backend",

  testEnvironment: "node",
  testMatch: [
    "<rootDir>/*/*.test.js",
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
