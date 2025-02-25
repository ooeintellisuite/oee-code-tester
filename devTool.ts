import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import chalk from 'chalk';
import inquirer from 'inquirer';

const CONFIG_PATH = path.join(__dirname, 'config.json');

interface Config {
  enabledChecks: {
    checkTsConfig: boolean;
    checkDependencies: boolean;
    checkGitignore: boolean;
    checkREADME: boolean;
    checkPrettierConfig: boolean;
    checkESLint: boolean;
  };
  dependenciesToCheck: string[];
}

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

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

if (!fs.existsSync(CONFIG_PATH)) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
}

const config: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

/**
 * Interactive main menu
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
 * Checks config to see which rules are enabled/disabled.
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

const expectedTsconfig = `
  {
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["apps", "packages"],
  "exclude": ["node_modules", "dist"]
}
`.trim();

/**
 * Reads the tsconfig.json file if it exists.
 */
function readTsConfig(tsconfigPath: string): string | null {
  if (!fs.existsSync(tsconfigPath)) return null;
  return fs.readFileSync(tsconfigPath, 'utf8').trim();
}

/**
 * Checks if the user's tsconfig.json matches the expected settings.
 */
function isTsConfigValid(userConfig: string, expectedConfig: string): boolean {
  return generateChecksum(userConfig) === generateChecksum(expectedConfig);
}

/**
 * Creates a new tsconfig.json with the expected settings.
 */
function createTsConfig(tsconfigPath: string, expectedConfig: string): void {
  console.log(chalk.red('❌ No tsconfig.json file found! Creating one...'));
  fs.writeFileSync(tsconfigPath, expectedConfig, 'utf8');
  console.log(chalk.green('✔ tsconfig.json has been created.'));
}

/**
 * Fixes tsconfig.json if it doesn't match the expected settings.
 */
function fixTsConfig(tsconfigPath: string, expectedConfig: string): void {
  console.log(chalk.red('❌ tsconfig.json is incorrect! Fixing it...'));
  fs.writeFileSync(tsconfigPath, expectedConfig, 'utf8');
  console.log(
    chalk.green(
      '✔ tsconfig.json has been updated to the correct configuration.',
    ),
  );
}

/**
 * Checks and validates tsconfig.json.
 */
function checkTsConfig(): void {
  console.log(chalk.yellow('🔍 Checking tsconfig.json...'));

  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  const userTsConfig = readTsConfig(tsconfigPath);

  if (!userTsConfig) {
    createTsConfig(tsconfigPath, expectedTsconfig);
  } else if (!isTsConfigValid(userTsConfig, expectedTsconfig)) {
    fixTsConfig(tsconfigPath, expectedTsconfig);
  } else {
    console.log(
      chalk.green('✔ tsconfig.json matches the expected configuration.'),
    );
  }
}

/**
 * Reads and parses the package.json file.
 */
function readPackageJson(packageJsonPath: string): PackageJson | null {
  if (!fs.existsSync(packageJsonPath)) return null;
  const fileContent = fs.readFileSync(packageJsonPath, 'utf8');
  return JSON.parse(fileContent) as PackageJson;
}

/**
 * Gets all installed dependencies (regular & dev dependencies).
 */
function getInstalledDependencies(packageJson: PackageJson): Set<string> {
  return new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]);
}

/**
 * Checks if all required dependencies are installed.
 */
function areDependenciesValid(
  installedDeps: Set<string>,
  requiredDeps: string[],
): boolean {
  let allPassed = true;

  requiredDeps.forEach((dep) => {
    if (!installedDeps.has(dep)) {
      console.log(chalk.red(`❌ Missing dependency: ${dep}`));
      console.log(chalk.red(`👉 Fix missing dependency: npm install ${dep}`));
      allPassed = false;
    } else {
      console.log(chalk.green(`✔ Found dependency: ${dep}`));
    }
  });

  return allPassed;
}

/**
 * Main function to check project dependencies.
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
 * Generates a SHA-256 checksum for a given string.
 */
function generateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Checks if a .gitignore file exists in the project directory.
 */
function checkGitignore(): boolean {
  console.log(chalk.yellow('🔍 Checking .gitignore...'));

  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const userGitignore = readGitignore(gitignorePath);
  const expectedGitignore = getExpectedGitignore();

  if (!userGitignore) {
    createGitignore(gitignorePath, expectedGitignore);
    return true;
  }

  if (isGitignoreValid(userGitignore, expectedGitignore)) {
    console.log(
      chalk.green('✔ .gitignore matches the expected configuration.'),
    );
    return true;
  }

  fixGitignore(gitignorePath, expectedGitignore);
  return true;
}

/**
 * Reads the .gitignore file if it exists in the project directory.
 */
function readGitignore(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8').trim();
}

/**
 * Returns the expected gitignore file.
 */
function getExpectedGitignore(): string {
  return `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
.env
node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`.trim();
}

/**
 * Creates a gitignore file if missing.
 */
function createGitignore(filePath: string, content: string): void {
  console.log(chalk.red('❌ No .gitignore file found! Creating one...'));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(chalk.green('✔ .gitignore has been created.'));
}

/**
 * Checks if the .gitignore content matches expectations.
 */
function isGitignoreValid(
  userContent: string,
  expectedContent: string,
): boolean {
  return generateChecksum(userContent) === generateChecksum(expectedContent);
}

/**
 * Fixes .gitignore if it's incorrect.
 */
function fixGitignore(filePath: string, content: string): void {
  console.log(chalk.red('❌ .gitignore is incorrect! Fixing it...'));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(
    chalk.green('✔ .gitignore has been updated to the correct configuration.'),
  );
}

/**
 * Checks if a README.md file exists in the project directory.
 */
function checkREADME(): boolean {
  console.log(chalk.yellow('Checking README.md...'));

  const readmePath = path.join(process.cwd(), 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.log(chalk.red('❌ No README.md file found!'));
    return false;
  } else {
    console.log(chalk.green('✔ README.md file exists.'));
    return true;
  }
}

// Define the recommended Prettier settings
const recommendedPrettierConfig = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
};

const expectedPrettierConfigString = JSON.stringify(
  recommendedPrettierConfig,
  null,
  2,
);

/**
 * Reads the user's Prettier configuration file.
 */
function readPrettierConfig(configPath: string): string | null {
  if (!fs.existsSync(configPath)) return null;
  return fs.readFileSync(configPath, 'utf8').trim();
}

/**
 * Checks if the user's Prettier configuration matches the recommended settings.
 */
function isPrettierConfigValid(
  userConfig: string,
  expectedConfig: string,
): boolean {
  return generateChecksum(userConfig) === generateChecksum(expectedConfig);
}

/**
 * Creates a new `.prettierrc` file with the recommended settings.
 */
function createPrettierConfig(
  configPath: string,
  expectedConfig: string,
): void {
  console.log(chalk.red('❌ .prettierrc not found! Creating one...'));
  fs.writeFileSync(configPath, expectedConfig, 'utf8');
  console.log(chalk.green('✔ .prettierrc has been created.'));
}

/**
 * Fixes the `.prettierrc` configuration if it doesn't match the recommended settings.
 */
function fixPrettierConfig(configPath: string, expectedConfig: string): void {
  console.log(chalk.red('❌ .prettierrc settings are incorrect! Fixing it...'));
  fs.writeFileSync(configPath, expectedConfig, 'utf8');
  console.log(chalk.green('✔ .prettierrc has been updated.'));
}

/**
 * Runs Prettier formatting.
 */
function runPrettier(): void {
  try {
    console.log(chalk.yellow('🚀 Running Prettier formatting...'));
    execSync('npx prettier --write .', { stdio: 'inherit' });
    console.log(chalk.green('✔ Prettier formatting completed.'));
  } catch (error) {
    console.error(chalk.red('❌ Prettier formatting failed.', error));
    process.exit(1);
  }
}

/**
 * Checks and validates the Prettier configuration.
 */
function checkPrettierConfig(): void {
  console.log(chalk.yellow('🔍 Checking Prettier configuration...'));

  const prettierConfigPath = path.join(process.cwd(), '.prettierrc');
  const userPrettierConfig = readPrettierConfig(prettierConfigPath);

  if (!userPrettierConfig) {
    createPrettierConfig(prettierConfigPath, expectedPrettierConfigString);
  } else if (
    !isPrettierConfigValid(userPrettierConfig, expectedPrettierConfigString)
  ) {
    fixPrettierConfig(prettierConfigPath, expectedPrettierConfigString);
  } else {
    console.log(
      chalk.green('✔ .prettierrc matches the recommended configuration.'),
    );
  }

  runPrettier();
}

/**
 * Returns the expected eslint config file.
 */
// eslint-disable-next-line max-lines-per-function
function getExpectedESLintConfig(): string {
  return `
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const globals = require('globals');
const noRedux = require('./eslint-plugin-custom-rules/rules/no-redux.js');

module.exports = [
  {
    ignores: [
      'dist',
      'eslint.config.js',
      'eslint-plugin-custom-rules/rules/no-redux.js'
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: require('@typescript-eslint/parser'),
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'custom-rules': {
        rules: { 'no-redux': noRedux },
      },
      import: require('eslint-plugin-import'),
      promise: require('eslint-plugin-promise'),
      'unused-imports': require('eslint-plugin-unused-imports'),
      react: require('eslint-plugin-react'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      next: require('@next/eslint-plugin-next'),
      security: require('eslint-plugin-security'),
      'no-secrets': require('eslint-plugin-no-secrets'),
      'jsdoc': require('eslint-plugin-jsdoc'),
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { args: 'after-used', vars: 'all' },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      'next/no-img-element': 'warn',
      'next/no-document-import-in-page': 'error',
      'next/no-head-element': 'error',
      'next/next-script-for-ga': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-object-injection': 'error',
      'no-secrets/no-secrets': 'error',
      'custom-rules/no-redux': 'warn',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', args: 'after-used' },
      ],
      'promise/prefer-await-to-then': 'warn',
      'max-lines-per-function': ['warn', { max: 50, skipComments: true }],
      'jsdoc/require-jsdoc': [
        'error',
        {
          checkConstructors: true,
          checkGetters: true,
          checkSetters: true,
          enableFixer: true,
          exemptEmptyConstructors: false,
          exemptEmptyFunctions: false,
          fixerMessage: '',
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { args: 'after-used', vars: 'all' },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
    },
  },
];`.trim();
}

/**
 * Reads the user's ESLint configuration.
 */
function readESLintConfig(configPath: string): string | null {
  if (!fs.existsSync(configPath)) return null;
  return fs.readFileSync(configPath, 'utf8').trim();
}

/**
 * Checks if the user's ESLint configuration matches the expected one.
 */
function isESLintConfigValid(
  userConfig: string,
  expectedConfig: string,
): boolean {
  return generateChecksum(userConfig) === generateChecksum(expectedConfig);
}

/**
 * Creates a new eslint.config.js file with the expected configuration.
 */
function createESLintConfig(configPath: string, expectedConfig: string): void {
  console.log(chalk.red('❌ No eslint.config.js found! Creating one...'));
  fs.writeFileSync(configPath, expectedConfig, 'utf8');
  console.log(chalk.green('✔ eslint.config.js has been created.'));
}

/**
 * Fixes the ESLint configuration if it's incorrect.
 */
function fixESLintConfig(configPath: string, expectedConfig: string): void {
  console.log(chalk.red('❌ eslint.config.js is incorrect! Fixing it...'));
  fs.writeFileSync(configPath, expectedConfig, 'utf8');
  console.log(
    chalk.green(
      '✔ eslint.config.js has been updated to the correct configuration.',
    ),
  );
}

/**
 * Runs ESLint checks.
 */
function runESLint(): void {
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

/**
 * Checks and validates the ESLint configuration.
 */
function checkESLint(): void {
  console.log(chalk.yellow('🔍 Checking ESLint configuration...'));

  const eslintConfigPath = path.join(process.cwd(), 'eslint.config.js');
  const userESLintConfig = readESLintConfig(eslintConfigPath);
  const expectedESLintConfig = getExpectedESLintConfig();

  if (!userESLintConfig) {
    createESLintConfig(eslintConfigPath, expectedESLintConfig);
  } else if (!isESLintConfigValid(userESLintConfig, expectedESLintConfig)) {
    fixESLintConfig(eslintConfigPath, expectedESLintConfig);
  } else {
    console.log(
      chalk.green('✔ eslint.config.js matches the expected configuration.'),
    );
  }

  runESLint();
}

mainMenu();
