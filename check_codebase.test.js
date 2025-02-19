import { expect, test } from "vitest";
import fs from "fs";
import path from "path";
import { 
    checkDependencies,
    checkGitignore,
    checkREADME,
    checkComponentsFolder,
    checkBuildTool,
    checkTestingFramework,
    checkImplicitAny,
    checkReactFCUsage,
    checkStateManagement,
    checkPrettierConfig,
    checkFunctionComments
} from "./devTool.js";

// Load config.json
const configPath = path.resolve(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8")).enabledChecks;

// Helper function to conditionally run tests
const conditionalTest = (key, description, callback) => {
  if (config[key]) {
    test(description, callback);
  } else {
    test.skip(description, callback);
  }
};

// Define tests conditionally
conditionalTest("checkDependencies", 
  "checkDependencies returns true when all required dependencies are installed in package.json", 
  () => expect(checkDependencies()).toBe(true)
);

conditionalTest("checkGitignore", 
  "checkGitignore returns true when a .gitignore file exists in the project directory", 
  () => expect(checkGitignore()).toBe(true)
);

conditionalTest("checkREADME", 
  "checkREADME returns true when a README file exists in the project directory", 
  () => expect(checkGitignore()).toBe(true)
);

conditionalTest("checkComponentsFolder", 
  "checkComponentsFolder returns true when 'components' folder exists in the project directory", 
  () => expect(checkComponentsFolder()).toBe(true)
);

conditionalTest("checkBuildTool", 
  "checkBuildTool returns true when Vite is used", 
  () => expect(checkBuildTool()).toBe(true)
);

conditionalTest("checkTestingFramework", 
  "checkTestingFramework returns true when Vitest is used", 
  () => expect(checkTestingFramework()).toBe(true)
);

conditionalTest("checkImplicitAny", 
  "checkImplicitAny returns true when no 'any' types are used", 
  () => expect(checkImplicitAny()).toBe(true)
);

conditionalTest("checkReactFCUsage", 
  "checkReactFCUsage returns true when no React.FC are used", 
  () => expect(checkReactFCUsage()).toBe(true)
);

conditionalTest("checkStateManagement", 
  "checkStateManagement returns true when Zustand is used", 
  () => expect(checkStateManagement()).toBe(true)
);

conditionalTest("checkPrettierConfig", 
  "checkPrettierConfig returns true when Prettier configuration file exists and matches recommended settings", 
  () => expect(checkPrettierConfig()).toBe(true)
);

conditionalTest("checkFunctionComments", 
  "checkFunctionComments returns true when all functions have JSDoc comments above their definitions", 
  () => expect(checkFunctionComments()).toBe(true)
);
