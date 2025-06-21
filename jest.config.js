const dotenv = require("dotenv");

dotenv.config({ path: "server/.env.development.local" });

module.exports = {
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleFileExtensions: ["ts", "js", "tsx", "json"],
  testPathIgnorePatterns: ["/node_modules/", "./dist"],
  testRegex: "/__tests__/(.*(.|/)(test|spec))\\.(js|ts|tsx)?$",
  testTimeout: 20_000,
};
