import { readFile } from './fileUtils';

/**
 * Represents the structure of a package.json file, containing dependencies and devDependencies.
 */
export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Reads and parses the package.json file.
 * @param {string} packageJsonPath - The file path to the package.json file.
 * @returns {PackageJson | null} The parsed package.json content as an object, or null if the file does not exist or cannot be read.
 */
export function readPackageJson(packageJsonPath: string): PackageJson | null {
  const fileContent = readFile(packageJsonPath);
  return fileContent ? (JSON.parse(fileContent) as PackageJson) : null;
}

/**
 * Retrieves all installed dependencies, including both regular and dev dependencies.
 * @param {PackageJson} packageJson - The parsed package.json object.
 * @returns {Set<string>} A set containing the names of all installed dependencies.
 */
export function getInstalledDependencies(
  packageJson: PackageJson,
): Set<string> {
  return new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]);
}

/**
 * Checks if all required dependencies are installed.
 * @param {Set<string>} installedDeps - A set of installed dependency names.
 * @param {string[]} requiredDeps - An array of required dependency names.
 * @returns {{ valid: boolean; missing: string[] }} An object indicating if dependencies are valid and listing any missing dependencies.
 */
export function areDependenciesValid(
  installedDeps: Set<string>,
  requiredDeps: string[],
): { valid: boolean; missing: string[] } {
  const missingDependencies: string[] = requiredDeps.filter(
    (dep) => !installedDeps.has(dep),
  );

  return {
    valid: missingDependencies.length === 0,
    missing: missingDependencies,
  };
}
