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
exports.generateSidebar = exports.copyDirectorySync = exports.ucToMarkdown = exports.getFeatures = exports.writeScreenshots = exports.writeSidebar = exports.writeFeature = exports.writeFeatures = exports.writeRoot = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const writeRoot = (cypressConfig, config) => {
    const packageRootDir = path.join(__dirname, '..', 'templates');
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir);
    const files = ['index.html', '.nojekyll', 'readme.md'];
    for (const file of files) {
        (0, fs_1.copyFileSync)(path.join(packageRootDir, file), path.join(outputDir, file));
    }
};
exports.writeRoot = writeRoot;
const writeFeatures = (cypressConfig, config, featureMap) => {
    const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
    for (const featurePath of Object.keys(featureMap)) {
        const useCases = featureMap[featurePath];
        const title = `# ${featurePath.split('/').pop()}`;
        const md = useCases.map(useCase => {
            const testContent = (0, fs_1.readFileSync)(path.join(testDir, featurePath, useCase), 'utf8');
            return (0, exports.ucToMarkdown)(cypressConfig, config, featurePath, testContent);
        });
        (0, exports.writeFeature)(cypressConfig, config, featurePath, [title, ...md].join('\n\n'));
    }
};
exports.writeFeatures = writeFeatures;
const writeFeature = (cypressConfig, config, featurePath, md) => {
    // Define the output file path
    const outputFile = path.join(cypressConfig.projectRoot, config.outDir, featurePath, `readme.md`);
    // Extract the directory path (excluding the file name)
    const outputDir = path.dirname(outputFile);
    // Ensure the full directory structure exists
    if (!(0, fs_1.existsSync)(outputDir)) {
        (0, fs_1.mkdirSync)(outputDir, { recursive: true });
    }
    (0, fs_1.writeFileSync)(outputFile, md);
};
exports.writeFeature = writeFeature;
const writeSidebar = (cypressConfig, config, featureMap) => {
    const outputFile = path.join(cypressConfig.projectRoot, config.outDir, `_sidebar.md`);
    const outputDir = path.dirname(outputFile);
    if (!(0, fs_1.existsSync)(outputDir)) {
        (0, fs_1.mkdirSync)(outputDir, { recursive: true });
    }
    (0, fs_1.writeFileSync)(outputFile, (0, exports.generateSidebar)(featureMap));
};
exports.writeSidebar = writeSidebar;
const writeScreenshots = (cypressConfig, config) => {
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir, 'screenshots');
    cypressConfig.screenshotsFolder && (0, exports.copyDirectorySync)(cypressConfig.screenshotsFolder, outputDir);
};
exports.writeScreenshots = writeScreenshots;
const getFeatures = (config, dir, currentPath = '', features = {}) => {
    const files = (0, fs_1.readdirSync)(dir);
    for (const file of files) {
        const p = [currentPath, file].join('/');
        const useCasePath = path.join(dir, file);
        if ((0, fs_1.statSync)(useCasePath).isDirectory()) {
            (0, exports.getFeatures)(config, useCasePath, p, features); // Recursively read subdirectories
        }
        else if (config.testRegex.test(useCasePath)) {
            ;
            (features[currentPath] = features[currentPath] || []).push(file);
        }
    }
    return features;
};
exports.getFeatures = getFeatures;
/**
 * Converts Cypress test file content to markdown format
 * @param content The content of the Cypress test file
 * @returns Markdown formatted content
 */
const ucToMarkdown = (cypressConfig, config, featurePath, content) => {
    const useCasePattern = 'usecase';
    const stepPattern = 'step';
    const screenshotPattern = 'screenshot';
    const descriptionPattern = 'description';
    const stepsTitle = 'Vaiheet';
    const useCaseRegex = new RegExp(`${useCasePattern}\\(['"]([^'"]+)['"]`);
    const useCaseMatch = content.match(useCaseRegex);
    const useCaseTitle = useCaseMatch === null || useCaseMatch === void 0 ? void 0 : useCaseMatch[1];
    const screenshotDir = path.join(cypressConfig.projectRoot, config.outDir, 'screenshots');
    if (!useCaseTitle)
        return null;
    // Build markdown
    let markdown = `## ${useCaseTitle}\n\n`;
    // Extract description
    const descriptionRegex = new RegExp(`${descriptionPattern}\\s*\\(\\s*['"]([^'"]+)['"]`);
    const descriptionMatch = content.match(descriptionRegex);
    if (descriptionMatch === null || descriptionMatch === void 0 ? void 0 : descriptionMatch[1]) {
        markdown += `### ${descriptionMatch[1]}\n\n`;
    }
    markdown += `### ${stepsTitle}\n\n`;
    const stepRegex = /step\s*\(\s*(['"])((?:\\\1|.)*?)\1\s*,/gs;
    let match;
    while ((match = stepRegex.exec(content)) !== null) {
        const stepName = match[2].trim();
        markdown += `* ${stepName}\n`;
        // Check if this step block contains a screenshot
        const screenshotMatch = content.slice(match.index).match(new RegExp(`${screenshotPattern}\\(['"]([^'"]+)['"]`));
        if (screenshotMatch) {
            const screenshotName = screenshotMatch[1];
            // Ensure correct path structure
            const fullScreenshotPath = path.join(screenshotDir, featurePath, 'main.spec.ts', `${screenshotName}.png`);
            markdown += `\n![${screenshotName}](${fullScreenshotPath})\n\n`;
        }
    }
    return markdown;
};
exports.ucToMarkdown = ucToMarkdown;
const copyDirectorySync = (source, destination) => {
    // Check if source exists and is a directory
    if (!(0, fs_1.existsSync)(source)) {
        return;
    }
    if (!(0, fs_1.statSync)(source).isDirectory()) {
        throw new Error(`Source '${source}'—is not a directory`);
    }
    // Create destination directory if it doesn't exist
    if (!(0, fs_1.existsSync)(destination)) {
        (0, fs_1.mkdirSync)(destination, { recursive: true });
    }
    // Read all items in the source directory
    const items = (0, fs_1.readdirSync)(source);
    // Process each item
    items.forEach(item => {
        const sourcePath = path.join(source, item);
        const destPath = path.join(destination, item);
        // Get stats to determine if it's a file or directory
        const stats = (0, fs_1.statSync)(sourcePath);
        if (stats.isDirectory()) {
            // Recursively copy subdirectory
            (0, exports.copyDirectorySync)(sourcePath, destPath);
        }
        else if (stats.isFile()) {
            // Copy file
            (0, fs_1.copyFileSync)(sourcePath, destPath);
        }
    });
};
exports.copyDirectorySync = copyDirectorySync;
const generateSidebar = (features) => {
    // Initialize tree with explicit type and required children property
    const tree = {
        children: {}
    };
    // Process paths from features object
    Object.keys(features).forEach(path => {
        const segments = path.slice(1).split('/'); // Remove leading slash
        let current = tree.children;
        segments.forEach((segment, index) => {
            if (!current[segment]) {
                current[segment] = { children: {} }; // Always initialize with children
            }
            if (index === segments.length - 1) {
                current[segment].path = path; // Store full path at leaf
            }
            current = current[segment].children;
        });
    });
    // Generate Markdown with explicit type
    function buildMarkdown(obj, indent = 0) {
        let result = '';
        const indentStr = '  '.repeat(indent);
        Object.keys(obj)
            .sort()
            .forEach(key => {
            const node = obj[key];
            if (node.path) {
                // Leaf node with link
                result += `${indentStr}* [${key}](${node.path}/readme.md)\n`;
            }
            else {
                // Parent node
                result += `${indentStr}* ${key}\n`;
                result += buildMarkdown(node.children, indent + 1);
            }
        });
        return result;
    }
    return buildMarkdown(tree.children);
};
exports.generateSidebar = generateSidebar;
