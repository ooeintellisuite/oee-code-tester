/* eslint-disable max-lines-per-function */
import { execSync } from 'child_process';

import chalk from 'chalk';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { checkPrettierConfig } from '../devTool';
import {
  createPrettierConfig,
  fixPrettierConfig,
  isPrettierConfigValid,
  readPrettierConfig,
} from '../utils/prettierUtils';

vi.mock('child_process', () => ({
  execSync: vi.fn(), // Mock Prettier execution
}));

vi.mock('../utils/prettierUtils', () => ({
  readPrettierConfig: vi.fn(),
  isPrettierConfigValid: vi.fn(),
  createPrettierConfig: vi.fn(),
  fixPrettierConfig: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('checkPrettierConfig', () => {
  it('should create a new .prettierrc file if it does not exist', () => {
    vi.mocked(readPrettierConfig).mockReturnValue(null); // Simulate missing .prettierrc
    const logSpy = vi.spyOn(console, 'log');
    checkPrettierConfig();

    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🔍 Checking Prettier configuration...'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      chalk.red('❌ .prettierrc not found! Creating one...'),
    );
    expect(vi.mocked(createPrettierConfig)).toHaveBeenCalled(); // Should create a new .gitignore
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green('✔ .prettierrc has been created.'),
    );
    logSpy.mockRestore();
  });

  it('should fix .prettierrc if it contains incorrect settings', () => {
    vi.mocked(readPrettierConfig).mockReturnValue('incorrect content'); // Simulate missing .prettierrc
    vi.mocked(isPrettierConfigValid).mockReturnValue(false);

    const logSpy = vi.spyOn(console, 'log');
    checkPrettierConfig();
    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🔍 Checking Prettier configuration...'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      chalk.red('❌ .prettierrc settings are incorrect! Fixing it...'),
    );
    expect(vi.mocked(fixPrettierConfig)).toHaveBeenCalled(); // Should fix the incorrect .gitignore
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green('✔ .prettierrc has been updated.'),
    );

    logSpy.mockRestore();
  });

  it('should run Prettier if the config is valid', () => {
    vi.mocked(readPrettierConfig).mockReturnValue('correct content');
    vi.mocked(isPrettierConfigValid).mockReturnValue(true);
    const logSpy = vi.spyOn(console, 'log');

    checkPrettierConfig();

    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🔍 Checking Prettier configuration...'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green('✔ .prettierrc matches the recommended configuration.'),
    );
    expect(vi.mocked(fixPrettierConfig)).not.toHaveBeenCalled();
    expect(vi.mocked(createPrettierConfig)).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🚀 Running Prettier formatting...'),
    );
    expect(execSync).toHaveBeenCalledWith('npx prettier --write .', {
      stdio: 'inherit',
    });
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green('✔ Prettier formatting completed.'),
    );

    logSpy.mockRestore();
  });
  it('should log an error and exit when Prettier formatting fails', () => {
    vi.mocked(readPrettierConfig).mockReturnValue('correct content');
    vi.mocked(isPrettierConfigValid).mockReturnValue(true);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });
    // Mock execSync to throw an error
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('Mocked Prettier formatting error');
    });

    // Run the function
    checkPrettierConfig();

    // Verify log messages
    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🔍 Checking Prettier configuration...'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green('✔ .prettierrc matches the recommended configuration.'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🚀 Running Prettier formatting...'),
    );

    // Ensure error logging is correct
    expect(errorSpy).toHaveBeenCalledWith(
      chalk.red('❌ Prettier formatting failed.'),
      expect.any(Error),
    );

    expect(logSpy).toHaveBeenCalledWith(
      chalk.red('\n👉 Fix Prettier config: npx prettier --write .'),
    );

    // Ensure process.exit is called with exit code 1
    expect(exitSpy).toHaveBeenCalledWith(1);

    // Ensure config creation/fixing was not triggered
    expect(vi.mocked(fixPrettierConfig)).not.toHaveBeenCalled();
    expect(vi.mocked(createPrettierConfig)).not.toHaveBeenCalled();

    // Restore mocks
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
