import chalk from "chalk";
import inquirer from "inquirer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { mainMenu, runChecks } from "../devTool"; // Adjust the import

// Mock dependencies
vi.mock("inquirer", () => ({
  prompt: vi.fn(),
}));

vi.mock("../yourFilePath", () => ({
  mainMenu: vi.fn(),
  runChecks: vi.fn(),
}));

describe("mainMenu", () => {
  let logSpy;
  let exitSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called"); // Prevent actual exit
    });

    vi.mocked(runChecks).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call runChecks when user selects 'Run'", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ choice: "Run" });

    await expect(mainMenu()).rejects.toThrow("process.exit called");

    expect(runChecks).toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("should call process.exit when user selects 'Exit'", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ choice: "Exit" });

    await expect(mainMenu()).rejects.toThrow("process.exit called");

    expect(exitSpy).toHaveBeenCalled();
    expect(runChecks).not.toHaveBeenCalled();
  });
});