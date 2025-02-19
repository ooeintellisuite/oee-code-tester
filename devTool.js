const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const inquirer = require('inquirer');
const CONFIG_PATH = path.join(__dirname, "config.json");

// Default Config
const defaultConfig = {
  enabledChecks: {
    checkDependencies: true,
    checkGitignore: true,
    checkREADME: true,
    checkComponentsFolder: true,
    checkBuildTool: true,
    checkTestingFramework: true,
    checkImplicitAny: true,
    checkReactFCUsage: true,
    checkStateManagement: true,
    checkPrettierConfig: true,
    checkFunctionComments: true
  },
  dependenciesToCheck: ["@tanstack/react-query", "@tanstack/react-query-devtools", "mssql"],
};

// Load or initialize config
if (!fs.existsSync(CONFIG_PATH)) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
}
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

/**
 * Displays the main menu and handles user selections.
 * Navigates to the selected option such as running checks or opening settings.
 * @returns {Promise<void>}
 */
async function mainMenu() {
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Select an option:",
      choices: ["Run", "Settings", "Exit"],
    },
  ]);

  if (choice === "Run") {
    runChecks();
  } else if (choice === "Settings") {
    settingsMenu();
  } else {
    console.log("Goodbye!");
    process.exit();
  }
}

/**
 * Displays the settings menu for configuring checks and dependencies.
 * @returns {Promise<void>}
 */
async function settingsMenu() {
  const { settingChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "settingChoice",
      message: "Settings Menu:",
      choices: ["Toggle Checks", "Edit Dependencies", "Back"],
    },
  ]);

  if (settingChoice === "Toggle Checks") {
    await toggleChecks();
  } else if (settingChoice === "Edit Dependencies") {
    await editDependencies();
  }
  mainMenu();
}

/**
 * Allows the user to enable or disable specific code checks.
 * Updates the configuration file accordingly.
 * @returns {Promise<void>}
 */
async function toggleChecks() {
  const { updatedChecks } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "updatedChecks",
      message: "Enable/Disable Checks:",
      choices: Object.keys(config.enabledChecks).map((key) => ({
        name: key,
        checked: config.enabledChecks[key],
      })),
    },
  ]);
  
  Object.keys(config.enabledChecks).forEach(key => {
    config.enabledChecks[key] = updatedChecks.includes(key);
  });
  saveConfig();
}

/**
 * Allows the user to edit the list of dependencies to check.
 * Updates the configuration file accordingly.
 * @returns {Promise<void>}
 */
async function editDependencies() {
  const { newDeps } = await inquirer.prompt([
    {
      type: "input",
      name: "newDeps",
      message: "Enter dependencies to check (comma-separated):",
      default: config.dependenciesToCheck.join(", "),
    },
  ]);
  
  config.dependenciesToCheck = newDeps.split(",").map(dep => dep.trim());
  saveConfig();
}

/**
 * Saves the current configuration to the config file.
 */
function saveConfig() {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

/**
 * Runs the enabled codebase checks based on the current configuration.
 */
function runChecks() {
  console.log(chalk.blue("\n🔍 Running codebase checks...\n"));
  if (config.enabledChecks.checkDependencies) checkDependencies();
  if (config.enabledChecks.checkGitignore) checkGitignore();
  if (config.enabledChecks.checkREADME) checkREADME();
  if (config.enabledChecks.checkComponentsFolder) checkComponentsFolder();
  if (config.enabledChecks.checkBuildTool) checkBuildTool();
  if (config.enabledChecks.checkTestingFramework) checkTestingFramework();
  if (config.enabledChecks.checkImplicitAny) checkImplicitAny();
  if (config.enabledChecks.checkReactFCUsage) checkReactFCUsage();
  if (config.enabledChecks.checkStateManagement) checkStateManagement();
  if (config.enabledChecks.checkPrettierConfig) checkPrettierConfig();
  if (config.enabledChecks.checkPrettierConfig) checkFunctionComments();
  console.log(chalk.green("\n✅ Codebase check complete.\n"));
  mainMenu();
}

/**
 * Checks if all required dependencies are installed in package.json.
 */
function checkDependencies() {
    console.log(chalk.yellow("Checking dependencies..."));
  
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.red("❌ No package.json found!"));
      return false;
    }
  
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
    let allPassed = true;
    config.dependenciesToCheck.forEach(dep => {
      if (!dependencies[dep]) {
        console.log(chalk.red(`❌ Missing dependency: ${dep}`));
        allPassed = false;
        return false;
      } else {
        console.log(chalk.green(`✔ Found dependency: ${dep}`));
      }
    });
  
    if (allPassed) {
      console.log(chalk.green("✔ All required dependencies are installed."));
      return true;
    }
    return false;
  }
  
   /**
   * Checks if a .gitignore file exists in the project directory.
   */
  function checkGitignore() {
    console.log(chalk.yellow("Checking .gitignore..."));
  
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
      console.log(chalk.red("❌ No .gitignore file found!"));
      return false;
    } else {
      console.log(chalk.green("✔ .gitignore file exists."));
      return true;
    }
  }

  /**
 * Checks if a README.md file exists in the project directory.
 */
  function checkREADME() {
    console.log(chalk.yellow("Checking README.md..."));

    const readmePath = path.join(process.cwd(), "README.md");
    if (!fs.existsSync(readmePath)) {
      console.log(chalk.red("❌ No README.md file found!"));
      return false;
    } else {
      console.log(chalk.green("✔ README.md file exists."));
      return true;
    }
  }
  
  /**
   * Checks if the 'components' folder exists in the project directory.
  */
  function checkComponentsFolder() {
    console.log(chalk.yellow("Checking components folder..."));
  
    const componentsPath = path.join(process.cwd(), "components");
    if (!fs.existsSync(componentsPath)) {
      console.log(chalk.red("❌ 'components' folder is missing!"));
      return false;
    } else {
      console.log(chalk.green("✔ 'components' folder exists."));
      return true;
    }
  }
  
  /**
   * Checks which build tool is being used (Vite, Webpack, or Create React App).
   */
  function checkBuildTool() {
    console.log(chalk.yellow("Checking build tool..."));
  
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.red("❌ No package.json found!"));
      return false;
    }
  
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
    if (dependencies["vite"]) {
      console.log(chalk.green("✔ Vite is being used as the build tool."));
      return true;
    } else if (dependencies["webpack"]) {
      console.log(chalk.red("❌ Webpack detected, but Vite is preferred!"));
      return false;
    } else if (dependencies["react-scripts"]) {
      console.log(chalk.red("❌ Create React App detected, but Vite is preferred!"));
      return false;
    } else {
      console.log(chalk.red("❌ No recognized build tool found."));
      return false;
    }
  }
  
    /**
     * Checks which testing framework is being used (Vitest or Jest).
     */
  function checkTestingFramework() {
    console.log(chalk.yellow("Checking testing framework..."));
  
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.red("❌ No package.json found!"));
      return false;
    }
  
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
    if (dependencies["vitest"]) {
      console.log(chalk.green("✔ Vitest is being used."));
      return true;
    } else if (dependencies["jest"]) {
      console.log(chalk.red("❌ Jest detected, but Vitest is preferred!"));
      return false;
    } else {
      console.log(chalk.red("❌ No recognized testing framework found."));
      return false;
    }
  }
  
    /**
   * Checks if TypeScript strict mode is enabled and scans for 'any' types.
   */
  function checkImplicitAny() {
    console.log(chalk.yellow("Checking for TypeScript 'implicit any' and strict mode..."));
  
    const tsConfigPath = path.join(process.cwd(), "tsconfig.json");
  
    // Ensure tsconfig.json exists
    if (!fs.existsSync(tsConfigPath)) {
      console.log(chalk.red("❌ tsconfig.json not found. Skipping TypeScript checks."));
      return false;
    }
  
    try {
      const tsConfigContent = fs.readFileSync(tsConfigPath, "utf8").trim();
  
      if (!tsConfigContent) {
        console.log(chalk.red("❌ tsconfig.json is empty."));
        return false;
      }
  
      const tsConfig = JSON.parse(tsConfigContent);
  
      // Check if "strict" mode is enabled
      if (!tsConfig.compilerOptions || tsConfig.compilerOptions.strict !== true) {
        console.log(chalk.red("❌ TypeScript strict mode is not enabled in tsconfig.json."));
      } else {
        console.log(chalk.green("✔ TypeScript strict mode is enabled."));
      }
    } catch (error) {
      console.log(chalk.red("❌ Failed to read or parse tsconfig.json."));
      return false;
    }
  
    // Scan for 'implicit any' issues in .ts and .tsx files
    const tsFiles = getAllFiles(process.cwd(), [".ts", ".tsx"]);
    let implicitAnyFound = false;
  
    tsFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      if (/:\s*any\b/.test(content)) {
        console.log(chalk.red(`❌ 'any' type found in: ${file}`));
        implicitAnyFound = true;
      }
    });
  
    if (!implicitAnyFound) {
      console.log(chalk.green("✔ No explicit 'any' types found."));
      return true;
    }
    return false;
  }
  
    /**
 * Recursively retrieves all files with specified extensions, excluding ignored directories.
 * @param {string} dir - The directory to scan.
 * @param {string[]} extensions - The file extensions to include.
 * @param {string[]} [ignoredDirs] - Directories to ignore.
 * @returns {string[]} - List of file paths.
 */
  function getAllFiles(dir, extensions, ignoredDirs = ["node_modules", ".git", "dist", "build"]) {
    let results = [];
  
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
      const res = path.join(dir, dirent.name);
  
      if (dirent.isDirectory()) {
        // Skip ignored directories
        if (!ignoredDirs.includes(dirent.name)) {
          results = results.concat(getAllFiles(res, extensions, ignoredDirs));
        }
      } else {
        // Include only files with specified extensions
        if (extensions.some(ext => res.endsWith(ext))) {
          results.push(res);
        }
      }
    });
  
    return results;
  }
  
    /**
 * Checks if React.FC is being used in TypeScript files.
 */
  function checkReactFCUsage() {
    console.log(chalk.yellow("Checking for React.FC usage..."));
  
    const tsFiles = getAllFiles(process.cwd(), [".tsx"]);
    let reactFCFound = false;
  
    tsFiles.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      if (/\bReact\.FC\b/.test(content)) {
        console.log(chalk.red(`❌ React.FC found in: ${file}`));
        reactFCFound = true;
      }
    });
  
    if (!reactFCFound) {
      console.log(chalk.green("✔ No React.FC usage detected."));
      return true;
    }
    return false;
  }
 
    /**
   * Checks which state management library is being used (Zustand or Redux).
   */
  function checkStateManagement() {
    console.log(chalk.yellow("Checking state management libraries..."));
  
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.red("❌ No package.json found!"));
      return false;
    }
  
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
    if (dependencies["redux"] || dependencies["@reduxjs/toolkit"]) {
      console.log(chalk.red("❌ Redux detected. Zustand is preferred!"));
      return false;
    } else if (dependencies["zustand"]) {
      console.log(chalk.green("✔ Zustand is being used."));
      return true;
    } else {
      console.log(chalk.red("❌ No recognized state management library found."));
      return false;
    }
  }
  
    /**
 * Checks if a Prettier configuration file exists and matches recommended settings.
 */
  function checkPrettierConfig() {
    console.log(chalk.yellow("Checking Prettier configuration..."));
  
    const prettierPath = path.join(process.cwd(), ".prettierrc");
  
    if (!fs.existsSync(prettierPath)) {
      console.log(chalk.red("❌ .prettierrc not found."));
      return false;
    }
  
    const prettierConfig = JSON.parse(fs.readFileSync(prettierPath, "utf8"));
  
    const recommendedSettings = {
      semi: true,
      singleQuote: true,
      trailingComma: "all",
      printWidth: 80,
      tabWidth: 2,
    };
  
    let allSettingsValid = true;
  
    for (const [key, value] of Object.entries(recommendedSettings)) {
      if (prettierConfig[key] !== value) {
        console.log(chalk.red(`❌ Incorrect setting in .prettierrc: "${key}" should be ${JSON.stringify(value)}`));
        allSettingsValid = false;
      }
    }
  
    if (allSettingsValid) {
      console.log(chalk.green("✔ Prettier settings match the recommended configuration."));
      return true;
    }
    return false;
  }

  /**
 * Checks if functions have JSDoc comments above their definitions.
 */
  function checkFunctionComments() {
    console.log(chalk.yellow("Checking for JSDoc comments above function definitions..."));
  
    const files = getAllFiles(process.cwd(), [".js", ".ts"]);
    let missingComments = false;
  
    files.forEach((file) => {
      let content = fs.readFileSync(file, "utf8");
  
      // Matches functions preceded by a JSDoc comment (/** ... */)
      const functionWithJSDocRegex =
        /\/\*\*[\s\S]*?\*\/\s*\n\s*(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/gm;
  
      // Matches ALL function declarations, ensuring they are not inside comments
      const allFunctionRegex =
        /^(?!.*\/\/)(?!.*\/\*)\s*(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/gm;
  
      // Matches variable-assigned functions (including arrow functions)
      const arrowFunctionRegex =
        /\/\*\*[\s\S]*?\*\/\s*\n\s*(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(?\s*[a-zA-Z0-9_,\s]*\)?\s*=>/gm;
  
      // Matches class methods (preceded by JSDoc)
      const classMethodRegex =
        /\/\*\*[\s\S]*?\*\/\s*\n\s*(?:async\s+)?([a-zA-Z0-9_]+)\s*\(/gm;
  
      // Extract function names that have JSDoc comments
      const documentedFunctions = new Set([
        ...[...content.matchAll(functionWithJSDocRegex)].map((match) => match[1]),
        ...[...content.matchAll(arrowFunctionRegex)].map((match) => match[1]),
        ...[...content.matchAll(classMethodRegex)].map((match) => match[1]),
      ]);
  
      // Extract all function names (ensuring they are actual code functions)
      const allFunctions = [
        ...[...content.matchAll(allFunctionRegex)].map((match) => match[1]),
        ...[...content.matchAll(arrowFunctionRegex)].map((match) => match[1]),
        ...[...content.matchAll(classMethodRegex)].map((match) => match[1]),
      ];
  
      // Find functions missing JSDoc
      const undocumentedFunctions = allFunctions.filter(
        (fn) => !documentedFunctions.has(fn)
      );
  
      if (undocumentedFunctions.length > 0) {
        console.log(chalk.red(`❌ Missing JSDoc comments in file: ${file}`));
        undocumentedFunctions.forEach((fn) => {
          console.log(`   ❌ Function "${fn}" lacks documentation.`);
        });
        missingComments = true;
      }
    });
  
    if (!missingComments) {
      console.log(chalk.green("✔ All functions have proper JSDoc documentation."));
      return true;
    }
    return false;
  }
  
  
mainMenu();

module.exports = { 
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
}