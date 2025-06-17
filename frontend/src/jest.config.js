module.exports = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!axios)/" // *no* ignorar axios, transpílalo con Babel
  ],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  }
};
