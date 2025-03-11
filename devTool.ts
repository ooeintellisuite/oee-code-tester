import { execSync } from 'child_process';
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
} from './utils/esLintUtils';
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
export async function mainMenu(): Promise<void> {
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
export function runChecks(): void {
  console.log(chalk.blue('\n🔍 Running codebase checks...\n'));
  if (config.enabledChecks.checkTsConfig) checkTsConfig();
  if (config.enabledChecks.checkDependencies) checkDependencies();
  if (config.enabledChecks.checkGitignore) checkGitignore();
  if (config.enabledChecks.checkREADME) checkREADME();
  if (config.enabledChecks.checkPrettierConfig) checkPrettierConfig();
  if (config.enabledChecks.checkESLint) checkESLintConfig();
  console.log(chalk.green('\n✅ Codebase check complete.\n'));
  mainMenu();
}

/**
 * Checks and validates the tsconfig.json file.
 * If it does not exist, it creates one. If it is incorrect, it fixes it.
 *  @returns {void}
 */
export function checkTsConfig(): void {
  console.log(chalk.yellow('🔍 Checking tsconfig.json...'));
  const userTsConfig = readTsConfig();
  if (!userTsConfig) {
      console.log(chalk.red('❌ No tsconfig.json file found! Creating one...'));
      createTsConfig();
      console.log(chalk.green('✔ tsconfig.json has been created.'));
  } else if (!isTsConfigValid(userTsConfig)) {
      console.log(chalk.red('❌ tsconfig.json is incorrect! Fixing it...'));
      fixTsConfig();
      console.log(
        chalk.green(
          '✔ tsconfig.json has been updated to the correct configuration.',
        ),
      );
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
export function checkDependencies(): boolean {
  console.log(chalk.yellow('🔍 Checking dependencies...'));

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = readPackageJson(packageJsonPath);

  if (!packageJson) {
    console.log(chalk.red('❌ No package.json found!'));
    console.log(chalk.red('👉 Fix missing package.json: npm init -y'));
    return false;
  }

  const installedDependencies = getInstalledDependencies(packageJson);
  const requiredDependencies = config.dependenciesToCheck;

  const result = areDependenciesValid(
    installedDependencies,
    requiredDependencies,
  );

  if (!result.valid) {
    result.missing.forEach((dep) => {
      console.log(chalk.red(`❌ Missing dependency: ${dep}`));
      console.log(chalk.red(`\n👉 Fix Missing dependency: npm install ${dep}`));
    });
  } else {
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
export function checkGitignore(): boolean {
  console.log(chalk.yellow('🔍 Checking .gitignore...'));
  const userGitignore = readGitignore();
  if (!userGitignore) {
    console.log(chalk.red('❌ No .gitignore file found! Creating one...'));
    createGitignore();
    console.log(chalk.green('✔ .gitignore has been created.'));
    return true;
  } else if (!isGitignoreValid(userGitignore)) {
    console.log(chalk.red('❌ .gitignore is incorrect! Fixing it...'));
    fixGitignore();
    console.log(
      chalk.green(
        '✔ .gitignore has been updated to the correct configuration.',
      ),
    );
  } else {
    console.log(
      chalk.green('✔ .gitignore matches the expected configuration.'),
    );
  }
  return true;
}

/**
 * Checks if a `README.md` file exists in the project directory.
 *
 * @returns {boolean} Returns `true` if `README.md` exists, otherwise `false`.
 */
export function checkREADME(): boolean {
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
export function checkPrettierConfig(): void {
  console.log(chalk.yellow('🔍 Checking Prettier configuration...'));

  const userPrettierConfig = readPrettierConfig();

  if (!userPrettierConfig) {
    console.log(chalk.red('❌ .prettierrc not found! Creating one...'));
    createPrettierConfig();
    console.log(chalk.green('✔ .prettierrc has been created.'));
  } else if (!isPrettierConfigValid(userPrettierConfig)) {
    console.log(chalk.red('❌ .prettierrc settings are incorrect! Fixing it...'));
    fixPrettierConfig();
    console.log(chalk.green('✔ .prettierrc has been updated.'));
  } else {
    try {
      console.log(chalk.yellow('🚀 Running Prettier formatting...'));
      console.log(
        chalk.green('✔ .prettierrc matches the recommended configuration.'),
      );
      execSync('npx prettier --write .', { stdio: 'inherit' });
      console.log(chalk.green('✔ Prettier formatting completed.'));
    } catch (error) {
      console.error(chalk.red('❌ Prettier formatting failed.'), error);
      console.log(chalk.red('\n👉 Fix Prettier config: npx prettier --write .'));
      process.exit(1);
    }
  }
}

/**
 * Checks and validates the ESLint configuration.
 * If no ESLint configuration is found, a default `eslint.config.js` is created.
 * If an invalid configuration is detected, it is fixed.
 * Finally, ESLint is run to check for linting issues.
 * @returns {void}
 */
export function checkESLintConfig(): void {
  console.log(chalk.yellow('🔍 Checking ESLint configuration...'));

  const userESLintConfig = readESLintConfig();

  if (!userESLintConfig) {
    console.log(chalk.red('❌ No eslint.config.js found! Creating one...'));
    createESLintConfig();
    console.log(chalk.green('✔ eslint.config.js has been created.'));
  } else if (!isESLintConfigValid(userESLintConfig)) {
    console.log(chalk.red('❌ eslint.config.js is incorrect! Fixing it...'));
    fixESLintConfig();
    console.log(
      chalk.green(
        '✔ eslint.config.js has been updated to the correct configuration.',
      ),
    );
  } else {
    console.log(
      chalk.green('✔ eslint.config.js matches the expected configuration.'),
    );
    try {
      console.log(chalk.yellow('🚀 Running ESLint checks...'));
      execSync('npx eslint .', { stdio: 'inherit' });
      console.log(chalk.green('✔ ESLint checks completed successfully.'));
    } catch (error) {
      console.error(chalk.red('❌ ESLint found issues.', error));
      console.log(chalk.red('\n👉 Fix ESLint config: npm run lint:fix'));
      process.exit(1);
    }
  }
}

mainMenu();
