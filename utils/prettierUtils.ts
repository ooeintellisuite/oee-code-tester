import { execSync } from 'child_process';
import path from 'path';

import chalk from 'chalk';

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
  console.log(chalk.red('❌ .prettierrc not found! Creating one...'));
  writeFile(prettierConfigPath, expectedPrettierConfigString);
  console.log(chalk.green('✔ .prettierrc has been created.'));
}

/**
 * Fixes the `.prettierrc` configuration by overwriting it with the recommended settings.
 *
 * @returns {void}
 */
export function fixPrettierConfig(): void {
  console.log(chalk.red('❌ .prettierrc settings are incorrect! Fixing it...'));
  writeFile(prettierConfigPath, expectedPrettierConfigString);
  console.log(chalk.green('✔ .prettierrc has been updated.'));
}

/**
 * Runs Prettier formatting on the project.
 * If formatting fails, logs an error and exits with a non-zero status.
 *
 * @returns {void}
 */
export function runPrettier(): void {
  try {
    console.log(chalk.yellow('🚀 Running Prettier formatting...'));
    execSync('npx prettier --write .', { stdio: 'inherit' });
    console.log(chalk.green('✔ Prettier formatting completed.'));
  } catch (error) {
    console.error(chalk.red('❌ Prettier formatting failed.', error));
    process.exit(1);
  }
}
