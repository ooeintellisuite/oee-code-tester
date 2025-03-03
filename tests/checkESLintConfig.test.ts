import { execSync } from 'child_process';

import chalk from 'chalk';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { checkESLintConfig } from '../devTool';
import { createESLintConfig, fixESLintConfig, isESLintConfigValid, readESLintConfig } from '../utils/esLintUtils';

vi.mock('child_process', () => ({
  execSync: vi.fn(), // Mock Prettier execution
}));

vi.mock('../utils/esLintUtils', () => ({
    readESLintConfig: vi.fn(),
    isESLintConfigValid: vi.fn(),
    createESLintConfig: vi.fn(),
    fixESLintConfig: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
});

describe('checkESLintConfig', () => {
  it('should create a new eslint.config.js file if it does not exist', () => {
     vi.mocked(readESLintConfig).mockReturnValue(null); // Simulate missing .prettierrc
     const logSpy = vi.spyOn(console, 'log');
     checkESLintConfig();

     expect(logSpy).toHaveBeenCalledWith(chalk.yellow('🔍 Checking ESLint configuration...'));
     expect(logSpy ).toHaveBeenCalledWith(chalk.red('❌ No eslint.config.js found! Creating one...'));
     expect(vi.mocked(createESLintConfig)).toHaveBeenCalled(); // Should create a new .gitignore
     expect(logSpy ).toHaveBeenCalledWith(chalk.green('✔ eslint.config.js has been created.'));
     logSpy.mockRestore();
  });

  it('should fix eslint.config.js if it contains incorrect settings', () => {
    vi.mocked(readESLintConfig).mockReturnValue('incorrect content'); // Simulate missing .prettierrc
    vi.mocked(isESLintConfigValid).mockReturnValue(false);
    
    const logSpy = vi.spyOn(console, 'log');
    checkESLintConfig();
    expect(logSpy).toHaveBeenCalledWith(chalk.yellow('🔍 Checking ESLint configuration...'));
    expect(logSpy).toHaveBeenCalledWith(chalk.red('❌ eslint.config.js is incorrect! Fixing it...'));
    expect(vi.mocked(fixESLintConfig)).toHaveBeenCalled(); // Should fix the incorrect .gitignore
    expect(logSpy ).toHaveBeenCalledWith(chalk.green('✔ eslint.config.js has been updated to the correct configuration.'));

    logSpy.mockRestore();
  });

  it('should run eslint.config.js if the config is valid', () => {
    vi.mocked(readESLintConfig).mockReturnValue('correct content');
    vi.mocked(isESLintConfigValid).mockReturnValue(true);
    const logSpy = vi.spyOn(console, 'log');

    checkESLintConfig();

    expect(logSpy).toHaveBeenCalledWith(chalk.yellow('🔍 Checking ESLint configuration...'));
    expect(logSpy).toHaveBeenCalledWith(chalk.green('✔ eslint.config.js matches the expected configuration.'));
    expect(vi.mocked(fixESLintConfig)).not.toHaveBeenCalled();
    expect(vi.mocked(createESLintConfig)).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(chalk.yellow('🚀 Running ESLint checks...'));
    expect(execSync).toHaveBeenCalledWith('npx eslint .', { stdio: 'inherit' });
    expect(logSpy).toHaveBeenCalledWith(chalk.green('✔ ESLint checks completed successfully.'));
    
    logSpy.mockRestore();
  });
  it('should log an error and exit when eslint.config.js fails', () => {
    // Mock console.error and process.exit
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    checkESLintConfig(); // Run function

    expect(errorSpy).toHaveBeenCalled(); // Ensure error logging happens
    expect(errorSpy.mock.calls[0][0]).toContain('❌ ESLint found issues');
    
    expect(exitSpy).toHaveBeenCalledWith(1); // Ensure process.exit is called

    // Restore mocks
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
