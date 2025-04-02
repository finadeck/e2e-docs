"use strict";
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
exports.generate = exports.generateDocs = exports.writeSidebar = exports.writeFeatures = void 0;
const path = __importStar(require("path"));
const fs_1 = require("fs");
const file_utils_1 = require("../utils/file-utils");
const markdown_utils_1 = require("../utils/markdown-utils");
const screenshot_utils_1 = require("../utils/screenshot-utils");
/**
 * Writes feature markdown files to the output directory
 */
const writeFeatures = (cypressConfig, config, featureMap) => {
    const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
    for (const featurePath of Object.keys(featureMap)) {
        const useCases = featureMap[featurePath];
        // Use the directory name as the feature title
        const title = `# ${featurePath.split('/').pop()}`;
        // Convert each use case to markdown
        const md = useCases.map(useCase => {
            const testFilePath = path.join(testDir, featurePath, useCase);
            const testContent = (0, fs_1.readFileSync)(testFilePath, 'utf8');
            return (0, markdown_utils_1.ucToMarkdown)(cypressConfig, config, featurePath, testContent);
        }).filter(Boolean); // Filter out null values
        // Write the feature markdown
        (0, file_utils_1.writeFeature)(cypressConfig, config, featurePath, [title, ...md].join('\n\n'));
    }
};
exports.writeFeatures = writeFeatures;
/**
 * Writes the sidebar file
 */
const writeSidebar = (cypressConfig, config, featureMap) => {
    const outputFile = path.join(cypressConfig.projectRoot, config.outDir, `_sidebar.md`);
    const outputDir = path.dirname(outputFile);
    (0, file_utils_1.ensureDirectoryExists)(outputDir);
    // Generate and write the sidebar content
    const sidebarContent = (0, markdown_utils_1.generateSidebar)(featureMap);
    require('fs').writeFileSync(outputFile, sidebarContent);
};
exports.writeSidebar = writeSidebar;
/**
 * Main function to generate documentation
 */
const generateDocs = (cypressConfig, config) => {
    // Get the test directory
    const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
    // Find all features
    const features = (0, file_utils_1.getFeatures)(config, testDir);
    // Generate documentation
    console.log(`Generating documentation for ${Object.keys(features).length} features...`);
    // Process screenshots first to ensure they're available when generating markdown
    console.log('Processing screenshots...');
    (0, screenshot_utils_1.copyScreenshotsToFeatures)(cypressConfig, config);
    // Generate feature documentation
    console.log('Generating feature documentation...');
    (0, exports.writeFeatures)(cypressConfig, config, features);
    // Generate sidebar
    console.log('Generating navigation sidebar...');
    (0, exports.writeSidebar)(cypressConfig, config, features);
    // Copy template files
    console.log('Copying template files...');
    (0, file_utils_1.writeRoot)(cypressConfig, config);
    console.log(`Documentation successfully generated in ${path.join(cypressConfig.projectRoot, config.outDir)}`);
};
exports.generateDocs = generateDocs;
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
    // Register after:run event
    on('after:run', () => (0, exports.generateDocs)(cypressConfig, finalConfig));
};
exports.generate = generate;
