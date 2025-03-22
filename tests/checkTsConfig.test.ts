/* eslint-disable max-lines-per-function */
import chalk from 'chalk';
import { describe, it, vi, beforeEach, expect } from 'vitest';

import { checkTsConfig } from '../devTool';
import {
  readTsConfig,
  createTsConfig,
  isTsConfigValid,
  fixTsConfig,
} from '../utils/tsConfigUtils';

// Mock the utils module
vi.mock('../utils/tsConfigUtils', () => ({
  readTsConfig: vi.fn(),
  createTsConfig: vi.fn(),
  isTsConfigValid: vi.fn(),
  fixTsConfig: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('checkTsConfig', () => {
  it('should create a tsconfig.json file if it does not exist', () => {
    vi.mocked(readTsConfig).mockReturnValue(null);
    const logSpy = vi.spyOn(console, 'log');
    checkTsConfig();
    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🔍 Checking tsconfig.json...'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      chalk.red('❌ No tsconfig.json file found! Creating one...'),
    );
    expect(vi.mocked(createTsConfig)).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green('✔ tsconfig.json has been created.'),
    );
    logSpy.mockRestore();
  });
  it('should fix the tsconfig.json file if it is incorrect', () => {
    vi.mocked(readTsConfig).mockReturnValue('incorrect content');
    vi.mocked(isTsConfigValid).mockReturnValue(false);
    const logSpy = vi.spyOn(console, 'log');
    checkTsConfig();
    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🔍 Checking tsconfig.json...'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      chalk.red('❌ tsconfig.json is incorrect! Fixing it...'),
    );
    expect(vi.mocked(fixTsConfig)).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green(
        '✔ tsconfig.json has been updated to the correct configuration.',
      ),
    );
    logSpy.mockRestore();
  });
  it('should do nothing if tsconfig.json is correct', () => {
    vi.mocked(readTsConfig).mockReturnValue('correct content');
    vi.mocked(isTsConfigValid).mockReturnValue(true);
    const logSpy = vi.spyOn(console, 'log');
    checkTsConfig();
    expect(logSpy).toHaveBeenCalledWith(
      chalk.yellow('🔍 Checking tsconfig.json...'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      chalk.green('✔ tsconfig.json matches the expected configuration.'),
    );
    expect(vi.mocked(fixTsConfig)).not.toHaveBeenCalled();
    expect(vi.mocked(createTsConfig)).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
