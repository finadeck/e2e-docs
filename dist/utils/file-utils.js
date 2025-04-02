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
exports.copyDirectorySync = exports.getFeatures = exports.writeFeature = exports.writeRoot = exports.ensureDirectoryExists = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
/**
 * Creates necessary directories if they don't exist
 */
const ensureDirectoryExists = (dirPath) => {
    if (!(0, fs_1.existsSync)(dirPath)) {
        (0, fs_1.mkdirSync)(dirPath, { recursive: true });
    }
};
exports.ensureDirectoryExists = ensureDirectoryExists;
/**
 * Copies template files to the output directory
 */
const writeRoot = (cypressConfig, config) => {
    const packageRootDir = path.join(__dirname, '..', '..', 'templates');
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir);
    (0, exports.ensureDirectoryExists)(outputDir);
    const files = ['index.html', '.nojekyll', 'readme.md'];
    for (const file of files) {
        (0, fs_1.copyFileSync)(path.join(packageRootDir, file), path.join(outputDir, file));
    }
};
exports.writeRoot = writeRoot;
/**
 * Writes a feature's markdown file to the output directory
 */
const writeFeature = (cypressConfig, config, featurePath, md) => {
    // Define the output file path
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir, featurePath);
    const outputFile = path.join(outputDir, `readme.md`);
    // Ensure the directory exists
    (0, exports.ensureDirectoryExists)(outputDir);
    // Write the markdown file
    (0, fs_1.writeFileSync)(outputFile, md);
};
exports.writeFeature = writeFeature;
/**
 * Scans the test directory and returns a map of features to test files
 */
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
 * Copies a directory and its contents recursively
 */
const copyDirectorySync = (source, destination) => {
    // Check if source exists and is a directory
    if (!(0, fs_1.existsSync)(source)) {
        return;
    }
    if (!(0, fs_1.statSync)(source).isDirectory()) {
        throw new Error(`Source '${source}'—is not a directory`);
    }
    // Create destination directory if it doesn't exist
    (0, exports.ensureDirectoryExists)(destination);
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
