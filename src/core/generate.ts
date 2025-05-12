// src/core/generate.ts
/// <reference types="cypress" />

import * as path from 'path';
import { Config, FeatureMap } from '../types';
import { getFeatures, ensureDirectoryExists } from '../utils/file-utils';
import { 
  collectAllFeatures,
  writeFeatureHtml,
  writeDirectoryIndexHtml,
  writeMainIndexHtml,
  copyCssFiles,
  FeatureData
} from '../utils/html-utils';
import { copyScreenshotsToFeatures } from '../utils/screenshot-utils';

/**
 * Writes feature HTML files to the output directory
 */
export const writeFeatures = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config,
  featureMap: FeatureMap
): void => {
  // Collect all features across all directories
  const allFeatures = collectAllFeatures(cypressConfig, config, featureMap);
  
  if (allFeatures.length === 0) {
    console.warn('No features found in test files. Make sure your test files use the feature() function.');
    return;
  }
  
  console.log(`Found ${allFeatures.length} features across ${Object.keys(featureMap).length} directories.`);
  
  // Group features by directory for directory indexes
  const featuresByDir: Record<string, FeatureData[]> = {};
  allFeatures.forEach(feature => {
    if (!featuresByDir[feature.dirPath]) {
      featuresByDir[feature.dirPath] = [];
    }
    featuresByDir[feature.dirPath].push(feature);
  });
  
  // Write individual feature pages
  console.log('Generating individual feature pages...');
  allFeatures.forEach(feature => {
    writeFeatureHtml(cypressConfig, config, feature, allFeatures);
  });
  
  // Write directory index pages
  console.log('Generating directory index pages...');
  Object.entries(featuresByDir).forEach(([dirPath, features]) => {
    writeDirectoryIndexHtml(cypressConfig, config, dirPath, features, allFeatures);
  });
  
  // Write main index.html
  console.log('Generating main index page...');
  writeMainIndexHtml(cypressConfig, config, allFeatures);
};

/**
 * Main function to generate documentation
 */
export const generateDocs = (cypressConfig: Cypress.PluginConfigOptions, config: Config): void => {
  // Get the test directory
  const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
  
  // Find all features
  const features = getFeatures(config, testDir);
  
  // Generate documentation
  console.log(`Generating HTML documentation from ${Object.keys(features).length} directories...`);
  
  // Process screenshots first to ensure they're available when generating HTML
  console.log('Processing screenshots...');
  copyScreenshotsToFeatures(cypressConfig, config);
  
  // Generate feature HTML documentation
  console.log('Generating feature HTML documentation...');
  writeFeatures(cypressConfig, config, features);
  
  // Copy CSS files
  console.log('Copying CSS files...');
  copyCssFiles(cypressConfig, config);
  
  console.log(`Documentation successfully generated in ${path.join(cypressConfig.projectRoot, config.outDir)}`);
};

/**
 * Standalone function to generate documentation without running tests
 */
export const generateStandalone = (
  projectRoot: string,
  config?: Partial<Config>
): void => {
  const defaultConfig: Config = {
    cypressDir: 'cypress', 
    testDir: 'e2e', 
    testRegex: /\.cy\.ts$/, 
    outDir: 'docs/use-cases'
  };
  
  const finalConfig: Config = { ...defaultConfig, ...config };
  
  // Create a minimal Cypress config object with just what we need
  const cypressConfig: Cypress.PluginConfigOptions = {
    projectRoot,
    screenshotsFolder: path.join(projectRoot, finalConfig.cypressDir, 'screenshots')
  } as Cypress.PluginConfigOptions;
  
  generateDocs(cypressConfig, finalConfig);
};

/**
 * Plugin registration function
 */
export const generate = (
  on: Cypress.PluginEvents, 
  cypressConfig: Cypress.PluginConfigOptions, 
  config?: Config & { generateOnlyWithCommand?: boolean }
): void => {
  const defaultConfig: Config = {
    cypressDir: 'cypress', 
    testDir: 'e2e', 
    testRegex: /\.cy\.ts$/, 
    outDir: 'docs/use-cases'
  };
  
  const finalConfig: Config = { ...defaultConfig, ...config };
  
  // Only register the after:run event if we're not using generateOnlyWithCommand
  if (!config?.generateOnlyWithCommand) {
    on('after:run', () => generateDocs(cypressConfig, finalConfig));
  }
  
  // Add a custom task to manually generate documentation
  on('task', {
    generateDocs: () => {
      generateDocs(cypressConfig, finalConfig);
      return null; // Return value is required for Cypress tasks
    }
  });
};