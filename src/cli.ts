#!/usr/bin/env node
// src/cli.ts

import { generateStandalone } from './core/generate';
import * as path from 'path';
import * as fs from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
const options: { [key: string]: string } = {};

// Process command line arguments
args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    options[key] = value || 'true';
  }
});

// Check for verbose mode
const verbose = options.verbose === 'true';

// Helper function for logging when in verbose mode
function verboseLog(...messages: any[]) {
  if (verbose) {
    console.log('[VERBOSE]', ...messages);
  }
}

// Get project root (default to current directory)
const projectRoot = options.projectRoot 
  ? path.resolve(options.projectRoot) 
  : process.cwd();

verboseLog('Using project root:', projectRoot);

// Validate project root exists
if (!fs.existsSync(projectRoot)) {
  console.error(`Error: Project root directory not found: ${projectRoot}`);
  process.exit(1);
}

// Check if cypress.config.js or cypress.config.ts exists to confirm it's a Cypress project
const configFileTsExists = fs.existsSync(path.join(projectRoot, 'cypress.config.ts'));
const configFileJsExists = fs.existsSync(path.join(projectRoot, 'cypress.config.js'));

if (!configFileTsExists && !configFileJsExists) {
  console.warn(`Warning: No cypress.config.ts or cypress.config.js found in ${projectRoot}.`);
  console.warn('This might not be a Cypress project, but continuing anyway...');
}

// Parse config options
const config: { [key: string]: any } = {};

if (options.cypressDir) config.cypressDir = options.cypressDir;
if (options.testDir) config.testDir = options.testDir;
if (options.outDir) config.outDir = options.outDir;
if (options.testRegex) {
  try {
    config.testRegex = new RegExp(options.testRegex);
  } catch (e) {
    console.error(`Error: Invalid regular expression for testRegex: ${options.testRegex}`);
    process.exit(1);
  }
}

// Validate cypress directory exists
const cypressDir = config.cypressDir || 'cypress';
const cypressDirPath = path.join(projectRoot, cypressDir);

if (!fs.existsSync(cypressDirPath)) {
  console.error(`Error: Cypress directory not found: ${cypressDirPath}`);
  console.error(`Check if the cypressDir option is correct (currently: ${cypressDir})`);
  process.exit(1);
}

// Validate test directory exists
const testDir = config.testDir || 'e2e';
const testDirPath = path.join(cypressDirPath, testDir);

if (!fs.existsSync(testDirPath)) {
  console.error(`Error: Test directory not found: ${testDirPath}`);
  console.error(`Check if the testDir option is correct (currently: ${testDir})`);
  process.exit(1);
}

// Log the directories being used
verboseLog('Cypress directory:', cypressDirPath);
verboseLog('Test directory:', testDirPath);

// Count test files to check if we found any
const testRegex = config.testRegex || /\.cy\.ts$/;
let testFileCount = 0;

function countTestFiles(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      countTestFiles(filePath);
    } else if (testRegex.test(file)) {
      testFileCount++;
      verboseLog('Found test file:', filePath);
    }
  }
}

countTestFiles(testDirPath);

if (testFileCount === 0) {
  console.warn(`Warning: No test files matching ${testRegex} found in ${testDirPath}`);
  console.warn('Check if your testRegex pattern is correct. Documentation might be empty.');
}

console.log('Generating documentation...');
console.log(`Project root: ${projectRoot}`);
console.log('Options:', config);
console.log(`Found ${testFileCount} test files for documentation`);

try {
  generateStandalone(projectRoot, config);
  
  // Get the output directory path
  const outDir = config.outDir || 'docs/use-cases';
  const outDirPath = path.join(projectRoot, outDir);
  
  console.log('Documentation generated successfully!');
  console.log(`Output directory: ${outDirPath}`);
  
  // Suggest how to view the documentation
  console.log(`\nTo view the documentation, open this file in your browser:`);
  console.log(`${path.join(outDirPath, 'index.html')}`);
} catch (error) {
  console.error('Error generating documentation:', error);
  process.exit(1);
}