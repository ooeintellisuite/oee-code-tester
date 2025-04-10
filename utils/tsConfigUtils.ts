import path from 'path';

import { generateChecksum } from './checksumUtils';
import { readFile, writeFile } from './fileUtils';

const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

const expectedTsconfig = `
  {
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["apps", "packages"],
  "exclude": ["node_modules", "dist"]
}
`.trim();

/**
 * Reads the content of the tsconfig.json file.
 * @returns {string | null} The content of tsconfig.json, or null if the file does not exist.
 */
export function readTsConfig(): string | null {
  return readFile(tsconfigPath);
}

/**
 * Checks if the user's tsconfig.json file matches the expected configuration.
 * @param {string} userConfig - The content of the user's tsconfig.json file.
 * @returns {boolean} True if the tsconfig.json matches the expected configuration, otherwise false.
 */
export function isTsConfigValid(userConfig: string): boolean {
  return generateChecksum(userConfig) === generateChecksum(expectedTsconfig);
}

/**
 * Creates a new tsconfig.json file with the expected settings if it does not exist.
 * @returns {void}
 */
export function createTsConfig(): void {
  writeFile(tsconfigPath, expectedTsconfig);
}

/**
 * Fixes the tsconfig.json file by replacing it with the expected settings.
 * @returns {void}
 */
export function fixTsConfig(): void {
  writeFile(tsconfigPath, expectedTsconfig);
}
