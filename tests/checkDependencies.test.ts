import chalk from "chalk";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { checkDependencies } from "../devTool";
import { readPackageJson, getInstalledDependencies, areDependenciesValid } from "../utils/dependencyUtils";

// Mock the entire helpers module
vi.mock("../utils/dependencyUtils", () => ({
  readPackageJson: vi.fn(),
  getInstalledDependencies: vi.fn(),
  areDependenciesValid: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
});

describe("checkDependencies", () => {
    it("should return false if package.json is missing", () => {
      vi.mocked(readPackageJson).mockReturnValue(null);
      const logSpy = vi.spyOn(console, 'log');

      const result = checkDependencies();
      expect(logSpy).toHaveBeenCalledWith(chalk.yellow('🔍 Checking dependencies...'));
      expect(logSpy).toHaveBeenCalledWith(chalk.red('❌ No package.json found!'));
      expect(logSpy ).toHaveBeenCalledWith(chalk.red('👉 Fix missing package.json: npm init -y'));
      expect(result).toBe(false);
      logSpy.mockRestore();
    });
  
    it("should return false if some required dependencies are missing", () => {
      vi.mocked(readPackageJson).mockReturnValue({dependencies: { react: "18.0.0" }, devDependencies: { vitest: "1.0.0" }});
      vi.mocked(getInstalledDependencies).mockReturnValue(new Set(["react"]));
      vi.mocked(areDependenciesValid).mockReturnValue({valid: false, missing: ["vitest"]});
      const logSpy = vi.spyOn(console, 'log');
      
      const result = checkDependencies();
      expect(logSpy).toHaveBeenCalledWith(chalk.red('❌ Missing dependency: vitest'));
      expect(logSpy).toHaveBeenCalledWith(chalk.red('\n👉 Fix Missing dependency: npm install vitest'));
      expect(result).toBe(false);  // Expect false because vitest is missing
      logSpy.mockRestore();
    });
      
    it("should return true if all required dependencies are installed", () => {
      // Simulate package.json with required dependencies
      vi.mocked(readPackageJson).mockReturnValue({dependencies: { react: "18.0.0" },devDependencies: { vitest: "1.0.0" }});
      vi.mocked(getInstalledDependencies).mockReturnValue(new Set(["react", "vitest"]));
      vi.mocked(areDependenciesValid).mockReturnValue({valid: true, missing: [""]});
      
      const logSpy = vi.spyOn(console, 'log');

      const result = checkDependencies();
      expect(logSpy).toHaveBeenCalledWith(chalk.green('✔ All required dependencies are installed.'));

  
      expect(result).toBe(true);
      logSpy.mockRestore();

    });
  });
