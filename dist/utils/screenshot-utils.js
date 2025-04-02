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
exports.verifyScreenshots = exports.copyScreenshotsToFeatures = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const file_utils_1 = require("./file-utils");
/**
 * Finds and copies screenshots from Cypress screenshots folder to the feature documentation directory
 * Modified to place screenshots in the same directory as the markdown files
 *
 * @param cypressConfig The Cypress configuration
 * @param config The plugin configuration
 */
const copyScreenshotsToFeatures = (cypressConfig, config) => {
    if (!cypressConfig.screenshotsFolder || !(0, fs_1.existsSync)(cypressConfig.screenshotsFolder)) {
        console.warn('Screenshots folder not found:', cypressConfig.screenshotsFolder);
        return;
    }
    const screenshotsBasePath = cypressConfig.screenshotsFolder;
    const outputBasePath = path.join(cypressConfig.projectRoot, config.outDir);
    // Map to track which test file (containing screenshot references) belongs to which feature directory
    const screenshotMap = new Map();
    // First, scan the test directory to build mapping between screenshot names and feature paths
    const buildScreenshotMap = (dirPath, basePath = '') => {
        try {
            const items = (0, fs_1.readdirSync)(dirPath);
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const relativePath = path.join(basePath, item);
                if ((0, fs_1.statSync)(itemPath).isDirectory()) {
                    buildScreenshotMap(itemPath, relativePath);
                }
                else if (config.testRegex.test(item)) {
                    // This is a test file, let's scan it for screenshot commands
                    try {
                        const content = require('fs').readFileSync(itemPath, 'utf8');
                        const screenshotRegex = /cy\.screenshot\(['"]([^'"]+)['"]/g;
                        let match;
                        while ((match = screenshotRegex.exec(content)) !== null) {
                            const screenshotName = match[1];
                            // Store the feature path for this screenshot
                            // The feature path is the directory containing the test file
                            const featurePath = basePath;
                            screenshotMap.set(screenshotName, featurePath);
                        }
                    }
                    catch (err) {
                        console.warn(`Error reading test file ${itemPath}:`, err);
                    }
                }
            }
        }
        catch (err) {
            console.warn(`Error scanning directory ${dirPath}:`, err);
        }
    };
    // Build the map between screenshot names and feature paths
    const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
    buildScreenshotMap(testDir);
    // Now process the screenshots directory
    const processScreenshots = (dirPath) => {
        try {
            const items = (0, fs_1.readdirSync)(dirPath);
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                if ((0, fs_1.statSync)(itemPath).isDirectory()) {
                    processScreenshots(itemPath);
                }
                else if (item.endsWith('.png')) {
                    // Extract screenshot name (without extension)
                    const screenshotName = path.basename(item, '.png');
                    // Look up the correct feature path for this screenshot
                    const featurePath = screenshotMap.get(screenshotName);
                    if (featurePath) {
                        // Destination is the feature's markdown directory
                        const destDir = path.join(outputBasePath, featurePath);
                        const destPath = path.join(destDir, item);
                        // Ensure the directory exists
                        (0, file_utils_1.ensureDirectoryExists)(destDir);
                        // Copy the screenshot
                        (0, fs_1.copyFileSync)(itemPath, destPath);
                    }
                    else {
                        // If screenshot is not mapped, try to extract the path from the directory structure
                        // This is a fallback for screenshots not explicitly tracked in our map
                        const screenshotDirPath = path.relative(screenshotsBasePath, dirPath);
                        const pathParts = screenshotDirPath.split(path.sep);
                        // Find the test file part (usually ending with .spec.ts or .cy.ts)
                        const testFileIndex = pathParts.findIndex(part => part.endsWith('.spec.ts') || part.endsWith('.cy.ts'));
                        if (testFileIndex > 0) {
                            // Get the feature path without the test file
                            const featurePath = pathParts.slice(0, testFileIndex).join('/');
                            // Destination is the feature's markdown directory
                            const destDir = path.join(outputBasePath, featurePath);
                            const destPath = path.join(destDir, item);
                            // Ensure the directory exists
                            (0, file_utils_1.ensureDirectoryExists)(destDir);
                            // Copy the screenshot
                            (0, fs_1.copyFileSync)(itemPath, destPath);
                        }
                    }
                }
            }
        }
        catch (err) {
            console.warn(`Error processing screenshots in ${dirPath}:`, err);
        }
    };
    processScreenshots(screenshotsBasePath);
    // Verify screenshot placement
    (0, exports.verifyScreenshots)(outputBasePath);
};
exports.copyScreenshotsToFeatures = copyScreenshotsToFeatures;
/**
 * Verifies that screenshots are correctly placed in the same directories as their corresponding markdown files
 */
const verifyScreenshots = (docsDir) => {
    try {
        let misplaced = 0;
        const processDir = (dirPath) => {
            const items = (0, fs_1.readdirSync)(dirPath);
            // Check if this directory has a readme.md file
            const hasReadme = items.includes('readme.md');
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                if ((0, fs_1.statSync)(itemPath).isDirectory()) {
                    processDir(itemPath);
                }
                else if (item.endsWith('.png') && !hasReadme) {
                    // This is a screenshot without a corresponding readme.md in the same directory
                    console.warn(`Warning: Screenshot ${itemPath} does not have a corresponding readme.md in the same directory`);
                    misplaced++;
                }
            }
        };
        processDir(docsDir);
        if (misplaced > 0) {
            console.warn(`Found ${misplaced} potentially misplaced screenshots. Check the log for details.`);
        }
        else {
            console.log('All screenshots are correctly placed with their corresponding markdown files');
        }
    }
    catch (err) {
        console.warn('Error verifying screenshots:', err);
    }
};
exports.verifyScreenshots = verifyScreenshots;
