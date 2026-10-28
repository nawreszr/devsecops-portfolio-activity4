const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Ignorer le dossier backend (ses tests sont lancés séparément)
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/backend/'],
};

module.exports = createJestConfig(customJestConfig);
