import * as path from 'path';

import chalk from 'chalk';
import inquirer from 'inquirer';

import {
  readPackageJson,
  getInstalledDependencies,
  areDependenciesValid,
} from './utils/dependencyUtils';
import {
  readESLintConfig,
  isESLintConfigValid,
  createESLintConfig,
  fixESLintConfig,
  runESLint,
} from './utils/esLintConfig';
import { fileExists, readFile, writeFile } from './utils/fileUtils';
import {
  readGitignore,
  createGitignore,
  isGitignoreValid,
  fixGitignore,
} from './utils/gitignoreUtils';
import {
  createPrettierConfig,
  fixPrettierConfig,
  isPrettierConfigValid,
  readPrettierConfig,
  runPrettier,
} from './utils/prettierUtils';
import {
  createTsConfig,
  isTsConfigValid,
  fixTsConfig,
  readTsConfig,
} from './utils/tsConfigUtils';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

/**
 * Represents the configuration settings for the codebase checks.
 */
interface Config {
  /**
   * Specifies which checks are enabled or disabled.
   */
  enabledChecks: {
    checkTsConfig: boolean;
    checkDependencies: boolean;
    checkGitignore: boolean;
    checkREADME: boolean;
    checkPrettierConfig: boolean;
    checkESLint: boolean;
  };
  /**
   * List of dependencies to check in package.json.
   */
  dependenciesToCheck: string[];
}

/**
 * Default configuration for the codebase checks.
 */
const defaultConfig: Config = {
  enabledChecks: {
    checkTsConfig: true,
    checkDependencies: true,
    checkGitignore: true,
    checkREADME: true,
    checkPrettierConfig: true,
    checkESLint: true,
  },
  dependenciesToCheck: [
    '@tanstack/react-query',
    '@tanstack/react-query-devtools',
    'mssql',
  ],
};

// Create config file if it does not exist
if (!fileExists(CONFIG_PATH)) {
  writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
}

/**
 * Reads and parses the configuration file.
 */
const config: Config = JSON.parse(readFile(CONFIG_PATH)!);

/**
 * Displays an interactive main menu allowing users to start or exit the checks.
 * @returns {Promise<void>} A promise that resolves when the menu action is completed.
 */
async function mainMenu(): Promise<void> {
  const { choice } = (await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select an option:',
      choices: ['Run', 'Exit'],
    },
  ])) as { choice: string };

  if (choice === 'Run') {
    runChecks();
  } else {
    console.log('Goodbye!');
    process.exit();
  }
}

/**
 * Runs the enabled codebase checks based on the configuration settings.
 *  @returns {void}
 */
function runChecks(): void {
  console.log(chalk.blue('\n🔍 Running codebase checks...\n'));
  if (config.enabledChecks.checkTsConfig) checkTsConfig();
  if (config.enabledChecks.checkDependencies) checkDependencies();
  if (config.enabledChecks.checkGitignore) checkGitignore();
  if (config.enabledChecks.checkREADME) checkREADME();
  if (config.enabledChecks.checkPrettierConfig) checkPrettierConfig();
  if (config.enabledChecks.checkESLint) checkESLint();
  console.log(chalk.green('\n✅ Codebase check complete.\n'));
  mainMenu();
}

/**
 * Checks and validates the tsconfig.json file.
 * If it does not exist, it creates one. If it is incorrect, it fixes it.
 *  @returns {void}
 */
function checkTsConfig(): void {
  console.log(chalk.yellow('🔍 Checking tsconfig.json...'));
  const userTsConfig = readTsConfig();
  if (!userTsConfig) {
    createTsConfig();
  } else if (!isTsConfigValid(userTsConfig)) {
    fixTsConfig();
  } else {
    console.log(
      chalk.green('✔ tsconfig.json matches the expected configuration.'),
    );
  }
}

/**
 * Checks if all required dependencies are installed.
 * 
 * @returns {boolean} Returns `true` if all required dependencies are installed, otherwise `false`.
 */
function checkDependencies(): boolean {
  console.log(chalk.yellow('🔍 Checking dependencies...'));

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = readPackageJson(packageJsonPath);

  if (!packageJson) {
    console.log(chalk.red('❌ No package.json found!'));
    console.log(chalk.blue('👉 Fix missing package.json: npm init -y'));
    return false;
  }

  const installedDependencies = getInstalledDependencies(packageJson);
  const requiredDependencies = config.dependenciesToCheck;

  const allPassed = areDependenciesValid(
    installedDependencies,
    requiredDependencies,
  );

  if (allPassed) {
    console.log(chalk.green('✔ All required dependencies are installed.'));
    return true;
  }

  return false;
}

/**
 * Checks if a `.gitignore` file exists in the project directory.
 * If it does not exist, a new one is created.
 * If it exists but is invalid, it is fixed.
 * 
 * @returns {boolean} Always returns `true` since it ensures a `.gitignore` file is properly set.
 */
function checkGitignore(): boolean {
  console.log(chalk.yellow('🔍 Checking .gitignore...'));

  const userGitignore = readGitignore();

  if (!userGitignore) {
    createGitignore();
    return true;
  }

  if (isGitignoreValid(userGitignore)) {
    console.log(
      chalk.green('✔ .gitignore matches the expected configuration.'),
    );
    return true;
  }

  fixGitignore();
  return true;
}

/**
 * Checks if a `README.md` file exists in the project directory.
 * 
 * @returns {boolean} Returns `true` if `README.md` exists, otherwise `false`.
 */
function checkREADME(): boolean {
  console.log(chalk.yellow('Checking README.md...'));

  const readmePath = path.join(process.cwd(), 'README.md');
  if (!fileExists(readmePath)) {
    console.log(chalk.red('❌ No README.md file found!'));
    return false;
  } else {
    console.log(chalk.green('✔ README.md file exists.'));
    return true;
  }
}

/**
 * Checks and validates the Prettier configuration.
 * If no configuration is found, a default `.prettierrc` is created.
 * If an invalid configuration is detected, it is fixed.
 * Finally, Prettier is run to enforce formatting rules.
 * @returns {void}
 */
function checkPrettierConfig(): void {
  console.log(chalk.yellow('🔍 Checking Prettier configuration...'));

  const userPrettierConfig = readPrettierConfig();

  if (!userPrettierConfig) {
    createPrettierConfig();
  } else if (!isPrettierConfigValid(userPrettierConfig)) {
    fixPrettierConfig();
  } else {
    console.log(
      chalk.green('✔ .prettierrc matches the recommended configuration.'),
    );
  }
  runPrettier();
}

/**
 * Checks and validates the ESLint configuration.
 * If no ESLint configuration is found, a default `eslint.config.js` is created.
 * If an invalid configuration is detected, it is fixed.
 * Finally, ESLint is run to check for linting issues.
 * @returns {void}
 */
function checkESLint(): void {
  console.log(chalk.yellow('🔍 Checking ESLint configuration...'));

  const userESLintConfig = readESLintConfig();

  if (!userESLintConfig) {
    createESLintConfig();
  } else if (!isESLintConfigValid(userESLintConfig)) {
    fixESLintConfig();
  } else {
    console.log(
      chalk.green('✔ eslint.config.js matches the expected configuration.'),
    );
  }
  runESLint();
}

mainMenu();
