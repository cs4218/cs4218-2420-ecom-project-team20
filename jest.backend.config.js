export default {
  displayName: "backend",

  testEnvironment: "node",
  testMatch: ["<rootDir>/*/*.test.js"],
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**"],
  coverageThreshold: {
    global: {
      lines: 10,
      functions: 10,
    },
  },
};
