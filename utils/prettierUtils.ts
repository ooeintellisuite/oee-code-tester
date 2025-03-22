import path from 'path';

import { generateChecksum } from './checksumUtils';
import { readFile, writeFile } from './fileUtils';

const prettierConfigPath = path.join(process.cwd(), '.prettierrc');

/**
 * Recommended Prettier settings.
 */
const recommendedPrettierConfig = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
};

const expectedPrettierConfigString = JSON.stringify(
  recommendedPrettierConfig,
  null,
  2,
);

/**
 * Reads the user's Prettier configuration file.
 *
 * @returns {string | null} - The content of the `.prettierrc` file, or `null` if the file does not exist.
 */
export function readPrettierConfig(): string | null {
  return readFile(prettierConfigPath);
}

/**
 * Checks if the user's Prettier configuration matches the recommended settings.
 *
 * @param {string} userConfig - The user's `.prettierrc` file content.
 * @returns {boolean} - `true` if the configuration matches the recommended settings, otherwise `false`.
 */
export function isPrettierConfigValid(userConfig: string): boolean {
  return (
    generateChecksum(userConfig) ===
    generateChecksum(expectedPrettierConfigString)
  );
}

/**
 * Creates a new `.prettierrc` file with the recommended settings if it does not exist.
 *
 * @returns {void}
 */
export function createPrettierConfig(): void {
  writeFile(prettierConfigPath, expectedPrettierConfigString);
}

/**
 * Fixes the `.prettierrc` configuration by overwriting it with the recommended settings.
 *
 * @returns {void}
 */
export function fixPrettierConfig(): void {
  writeFile(prettierConfigPath, expectedPrettierConfigString);
}
