module.exports = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!axios)/"
  ],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  }
};
