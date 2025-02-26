import fs from 'fs';

/**
 * Checks if a file exists at the given path.
 *
 * @param {string} filePath - The path to the file.
 * @returns {boolean} - Returns `true` if the file exists, otherwise `false`.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Reads the contents of a file.
 *
 * @param {string} filePath - The path to the file.
 * @returns {string | null} - The file content as a string, or `null` if the file does not exist.
 */
export function readFile(filePath: string): string | null {
  if (!fileExists(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8').trim();
}

/**
 * Writes content to a file, overwriting it if it already exists.
 *
 * @param {string} filePath - The path to the file.
 * @param {string} content - The content to write to the file.
 * @returns {void}
 */
export function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
  return;
}
