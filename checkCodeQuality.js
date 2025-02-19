// #!/usr/bin/env node

// const fs = require("fs");
// const path = require("path");
// const chalk = require("chalk");

// function getAllFiles(dir, extensions, excludeDirs = ["node_modules", ".git"]) {
//   let files = [];

//   function readDir(directory) {
//     fs.readdirSync(directory).forEach(file => {
//       const fullPath = path.join(directory, file);
//       if (fs.statSync(fullPath).isDirectory()) {
//         if (!excludeDirs.includes(file)) {
//           readDir(fullPath);
//         }
//       } else if (extensions.some(ext => fullPath.endsWith(ext))) {
//         files.push(fullPath);
//       }
//     });
//   }

//   readDir(dir);
//   return files;
// }

// function checkFunctionComments() {
//   console.log(chalk.yellow("Checking for JSDoc comments above function definitions..."));

//   const files = getAllFiles(process.cwd(), [".js", ".ts"]);
//   let missingComments = false;

//   files.forEach(file => {
//     const content = fs.readFileSync(file, "utf8");

//     const functionWithJSDocRegex = /\/\*\*[\s\S]*?\*\/\s*\n\s*function\s+([a-zA-Z0-9_]+)\s*\(/gm;
//     const allFunctionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/gm;

//     const documentedFunctions = new Set([...content.matchAll(functionWithJSDocRegex)].map(match => match[1]));
//     const allFunctions = [...content.matchAll(allFunctionRegex)].map(match => match[1]);

//     const undocumentedFunctions = allFunctions.filter(fn => !documentedFunctions.has(fn));

//     if (undocumentedFunctions.length > 0) {
//       console.log(chalk.red(`❌ Missing JSDoc comments in file: ${file}`));
//       undocumentedFunctions.forEach(fn => {
//         console.log(`   ❌ Function "${fn}" lacks documentation.`);
//       });
//       missingComments = true;
//     }
//   });

//   if (missingComments) {
//     console.log(chalk.red("❌ Commit aborted. Please add JSDoc comments to all functions."));
//     process.exit(1); // Prevent commit
//   } else {
//     console.log(chalk.green("✔ All functions have proper JSDoc documentation."));
//     process.exit(0); // Allow commit
//   }
// }

// // Run the check automatically
// checkFunctionComments();
