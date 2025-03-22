/* eslint-disable max-lines-per-function */
import inquirer from 'inquirer';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';

import * as devToolModule from '../devTool';

vi.mock('inquirer', async () => {
  return {
    default: {
      prompt: vi.fn().mockResolvedValue({ choice: 'Run' }),
    },
  };
});

describe('mainMenu', () => {
  beforeEach(() => {
    // Mock the ESLint check to avoid failing during tests
    vi.spyOn(devToolModule, 'checkESLintConfig').mockResolvedValue(undefined);

    // Mock runChecks as well
    vi.spyOn(devToolModule, 'runChecks').mockImplementation(async () => {
      console.log('Mocked runChecks()');
      throw new Error('ESLint check failed'); // Simulate ESLint failure
    });

    vi.spyOn(inquirer, 'prompt').mockResolvedValue({ choice: 'Run' });

    vi.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call runChecks() when "Run" is selected', async () => {
    vi.spyOn(process, 'exit').mockImplementation(((
      code?: string | number | null | undefined,
    ) => {
      console.log('process.exit() called', code);
    }) as never);
    try {
      await devToolModule.mainMenu();
    } catch (error) {
      // Ensure the error was caused by process.exit
      expect(error.message).toBe('process.exit() was called');

      // Check if process.exit() was called
      expect(process.exit).toHaveBeenCalledWith(1);

      // Ensure that runChecks was called
      expect(devToolModule.runChecks).toHaveBeenCalled();

      // Ensure the error message is as expected
      expect(error.message).toBe('ESLint check failed');
    }
  }, 20000);

  it('should call process.exit when "Exit" is selected', async () => {
    vi.spyOn(process, 'exit').mockImplementation((): never => {
      console.log('process.exit() called');

      throw new Error('process.exit() was called');
    });
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ choice: 'Exit' });

    await expect(devToolModule.mainMenu()).rejects.toThrow(
      'process.exit() was called',
    );
    expect(process.exit).toHaveBeenCalled();
  });
});
