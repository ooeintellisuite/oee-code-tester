import crypto from 'crypto';

/**
 * Generates a SHA-256 checksum for the given content.
 * @param {string} content - The input string for which the checksum is generated.
 * @returns {string} The SHA-256 hash of the input content in hexadecimal format.
 */
export function generateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}
