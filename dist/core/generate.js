"use strict";
// src/core/generate.ts
/// <reference types="cypress" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.generateStandalone = exports.generateDocs = exports.writeFeatures = void 0;
const path = __importStar(require("path"));
const file_utils_1 = require("../utils/file-utils");
const html_utils_1 = require("../utils/html-utils");
const screenshot_utils_1 = require("../utils/screenshot-utils");
/**
 * Writes feature HTML files to the output directory
 */
const writeFeatures = (cypressConfig, config, featureMap) => {
    // Create a map of features by directory path
    const featuresByPath = (0, html_utils_1.createFeaturesByPath)(cypressConfig, config, featureMap);
    // Process each directory
    Object.entries(featuresByPath).forEach(([dirPath, features]) => {
        // Write the HTML for this directory
        (0, html_utils_1.writeDirectoryHtml)(cypressConfig, config, dirPath, features, featuresByPath);
    });
    // Write index.html
    (0, html_utils_1.writeIndexHtml)(cypressConfig, config, featuresByPath);
};
exports.writeFeatures = writeFeatures;
/**
 * Main function to generate documentation
 */
const generateDocs = (cypressConfig, config) => {
    // Get the test directory
    const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
    // Find all features
    const features = (0, file_utils_1.getFeatures)(config, testDir);
    // Generate documentation
    console.log(`Generating HTML documentation for ${Object.keys(features).length} directories...`);
    // Process screenshots first to ensure they're available when generating HTML
    console.log('Processing screenshots...');
    (0, screenshot_utils_1.copyScreenshotsToFeatures)(cypressConfig, config);
    // Generate feature HTML documentation
    console.log('Generating feature HTML documentation...');
    (0, exports.writeFeatures)(cypressConfig, config, features);
    // Copy CSS files
    console.log('Copying CSS files...');
    (0, html_utils_1.copyCssFiles)(cypressConfig, config);
    console.log(`Documentation successfully generated in ${path.join(cypressConfig.projectRoot, config.outDir)}`);
};
exports.generateDocs = generateDocs;
/**
 * Standalone function to generate documentation without running tests
 */
const generateStandalone = (projectRoot, config) => {
    const defaultConfig = {
        cypressDir: 'cypress',
        testDir: 'e2e',
        testRegex: /\.cy\.ts$/,
        outDir: 'docs/use-cases'
    };
    const finalConfig = { ...defaultConfig, ...config };
    // Create a minimal Cypress config object with just what we need
    const cypressConfig = {
        projectRoot,
        screenshotsFolder: path.join(projectRoot, finalConfig.cypressDir, 'screenshots')
    };
    (0, exports.generateDocs)(cypressConfig, finalConfig);
};
exports.generateStandalone = generateStandalone;
/**
 * Plugin registration function
 */
const generate = (on, cypressConfig, config) => {
    const defaultConfig = {
        cypressDir: 'cypress',
        testDir: 'e2e',
        testRegex: /\.cy\.ts$/,
        outDir: 'docs/use-cases'
    };
    const finalConfig = { ...defaultConfig, ...config };
    // Only register the after:run event if we're not using generateOnlyWithCommand
    if (!(config === null || config === void 0 ? void 0 : config.generateOnlyWithCommand)) {
        on('after:run', () => (0, exports.generateDocs)(cypressConfig, finalConfig));
    }
    // Add a custom task to manually generate documentation
    on('task', {
        generateDocs: () => {
            (0, exports.generateDocs)(cypressConfig, finalConfig);
            return null; // Return value is required for Cypress tasks
        }
    });
};
exports.generate = generate;
