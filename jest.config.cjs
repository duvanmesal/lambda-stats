// jest.config.cjs

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Para que CI no falle aunque aún no tengas tests
  passWithNoTests: true,
};
