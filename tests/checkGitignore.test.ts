import chalk from 'chalk';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { checkGitignore } from '../devTool';
import { readGitignore, createGitignore, fixGitignore, isGitignoreValid } from '../utils/gitignoreUtils';

vi.mock('../utils/gitignoreUtils', () => ({
    readGitignore: vi.fn(),
    isGitignoreValid: vi.fn(),
    fixGitignore: vi.fn(),
    createGitignore: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
});

describe('checkGitignore', () => {
    it('should create a .gitignore file if it does not exist', () => {
        // Mock readGitignore to return null (simulating a missing file)
        vi.mocked(readGitignore).mockReturnValue(null);
        const logSpy = vi.spyOn(console, 'log');
        const result = checkGitignore();
        // Logs should indicate creation
        expect(logSpy).toHaveBeenCalledWith(chalk.yellow('🔍 Checking .gitignore...'));
        expect(logSpy ).toHaveBeenCalledWith(chalk.red('❌ No .gitignore file found! Creating one...'));
        expect(vi.mocked(createGitignore)).toHaveBeenCalled(); // Should create a new .gitignore
        expect(logSpy ).toHaveBeenCalledWith(chalk.green('✔ .gitignore has been created.'));
        expect(result).toBe(true);
        logSpy.mockRestore();
    });

    it('should fix the .gitignore file if it is incorrect', () => {
        vi.mocked(readGitignore).mockReturnValue('incorrect content');
        vi.mocked(isGitignoreValid).mockReturnValue(false);
        const logSpy = vi.spyOn(console, 'log');
        const result = checkGitignore();
        expect(logSpy).toHaveBeenCalledWith(chalk.yellow('🔍 Checking .gitignore...'));
        expect(logSpy).toHaveBeenCalledWith(chalk.red('❌ .gitignore is incorrect! Fixing it...'));
        expect(vi.mocked(fixGitignore)).toHaveBeenCalled(); // Should fix the incorrect .gitignore
        expect(logSpy ).toHaveBeenCalledWith(chalk.green('✔ .gitignore has been updated to the correct configuration.'));
        expect(result).toBe(true);
        logSpy.mockRestore();
    });

    it('should do nothing if .gitignore is correct', () => {
        vi.mocked(readGitignore).mockReturnValue('correct content');
        vi.mocked(isGitignoreValid).mockReturnValue(true);
        const logSpy = vi.spyOn(console, 'log');

        const result = checkGitignore();

        expect(logSpy).toHaveBeenCalledWith(chalk.yellow('🔍 Checking .gitignore...'));
        expect(logSpy).toHaveBeenCalledWith(
            chalk.green('✔ .gitignore matches the expected configuration.')
        );
        expect(vi.mocked(fixGitignore)).not.toHaveBeenCalled();
        expect(vi.mocked(createGitignore)).not.toHaveBeenCalled();
        expect(result).toBe(true);
        logSpy.mockRestore();
    });
});
