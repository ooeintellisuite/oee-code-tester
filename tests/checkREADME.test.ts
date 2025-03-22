import chalk from 'chalk';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { checkREADME } from '../devTool';
import { fileExists } from '../utils/fileUtils';

vi.mock('../utils/fileUtils', () => ({
  fileExists: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn().mockReturnValue(null),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('checkREADME', () => {
  it('should return false and log an error if README.md does not exist', () => {
    vi.mocked(fileExists).mockReturnValue(false);

    const logSpy = vi.spyOn(console, 'log');

    const result = checkREADME();

    expect(logSpy).toHaveBeenCalledWith(chalk.yellow('Checking README.md...'));
    expect(logSpy).toHaveBeenCalledWith(
      chalk.red('❌ No README.md file found!'),
    );
    expect(result).toBe(false);

    logSpy.mockRestore();
  });
  it('should return true and log success if README.md exists', () => {
    vi.mocked(fileExists).mockReturnValue(true);

    const logSpy = vi.spyOn(console, 'log');

    const result = checkREADME();

    expect(logSpy).toHaveBeenCalledWith(chalk.yellow('Checking README.md...'));
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green('✔ README.md file exists.'),
    );
    expect(result).toBe(true);

    logSpy.mockRestore();
  });
});
