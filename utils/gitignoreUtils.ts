import path from 'path';

import { generateChecksum } from './checksumUtils';
import { readFile, writeFile } from './fileUtils';

const gitignorePath = path.join(process.cwd(), '.gitignore');

const expectedGitignore = `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
.env
node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`.trim();

/**
 * Reads the content of the .gitignore file.
 * @returns {string | null} The content of the .gitignore file, or null if the file does not exist.
 */
export function readGitignore(): string | null {
  return readFile(gitignorePath);
}

/**
 * Creates a .gitignore file with the expected content if it does not exist.
 * @returns {void}
 */
export function createGitignore(): void {
  writeFile(gitignorePath, expectedGitignore);
}

/**
 * Checks if the .gitignore file matches the expected content.
 * @param {string} userConfig - The content of the user's .gitignore file.
 * @returns {boolean} True if the .gitignore file matches the expected content, otherwise false.
 */
export function isGitignoreValid(userConfig: string): boolean {
  return generateChecksum(userConfig) === generateChecksum(expectedGitignore);
}

/**
 * Fixes the .gitignore file by replacing it with the expected content.
 * @returns {void}
 */
export function fixGitignore(): void {
  writeFile(gitignorePath, expectedGitignore);
}
