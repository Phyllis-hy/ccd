import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
    "^react-markdown$": "<rootDir>/__mocks__/react-markdown.tsx",
    "^remark-gfm$": "<rootDir>/__mocks__/remark-gfm.ts",
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],
};

export default createJestConfig(customJestConfig);
