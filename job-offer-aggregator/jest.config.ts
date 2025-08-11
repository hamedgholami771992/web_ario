import type { Config } from 'jest';
// import * as dotenv from 'dotenv';
// import * as path from 'path';

// // Load .env from project root (or any path you need)
// dotenv.config({ path: path.resolve(__dirname, '.env') });


const config: Config = {
  rootDir: '.',
  testMatch: [
    '<rootDir>/test/unit/**/*.spec.ts',
    '<rootDir>/test/integration/**/*.spec.ts',
    // '<rootDir>/test/e2e/**/*.spec.ts',
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // if you're using paths like @/jobs
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.build.json'
    }
  }
};

export default config;
