"use strict";
// src/utils/html-utils.ts
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
exports.copyCssFiles = exports.writeIndexHtml = exports.writeDirectoryHtml = exports.createFeaturesByPath = exports.generateNavigation = exports.processTestFileToHtml = exports.featureToHtml = exports.useCaseToHtml = exports.processTestFile = exports.extractUseCases = exports.extractFeaturesAndUseCases = exports.processTemplate = exports.getRelativePath = exports.slugify = exports.escapeHtml = void 0;
const path = __importStar(require("path"));
const fs_1 = require("fs");
const file_utils_1 = require("./file-utils");
/**
 * Escapes HTML special characters
 */
const escapeHtml = (text) => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
exports.escapeHtml = escapeHtml;
/**
 * Creates a URL-friendly slug from a string
 */
const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};
exports.slugify = slugify;
/**
 * Helper function to calculate relative path between current and target
 */
const getRelativePath = (from, to) => {
    // If the 'from' path is empty or root, we're at the index
    if (!from || from === '/') {
        return to.substring(1); // Remove leading slash
    }
    // Split paths into segments
    const fromParts = from.split('/').filter(Boolean);
    const toParts = to.split('/').filter(Boolean);
    // Find common path
    let commonLength = 0;
    const minLength = Math.min(fromParts.length, toParts.length);
    for (let i = 0; i < minLength; i++) {
        if (fromParts[i] === toParts[i]) {
            commonLength++;
        }
        else {
            break;
        }
    }
    // Build relative path
    const upCount = fromParts.length - commonLength;
    const relativeParts = [...Array(upCount).fill('..'), ...toParts.slice(commonLength)];
    // Return the relative path, defaulting to current directory if same path
    return relativeParts.length ? relativeParts.join('/') : '.';
};
exports.getRelativePath = getRelativePath;
/**
 * Reads an HTML template file and replaces placeholders
 *
 * @param templatePath Path to the template file
 * @param replacements Object with placeholder replacements
 * @returns Processed template content
 */
const processTemplate = (templatePath, replacements) => {
    let template = (0, fs_1.readFileSync)(templatePath, 'utf8');
    Object.entries(replacements).forEach(([placeholder, value]) => {
        const regex = new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g');
        template = template.replace(regex, value);
    });
    return template;
};
exports.processTemplate = processTemplate;
/**
 * Extract all features and their use cases from a Cypress test file
 */
const extractFeaturesAndUseCases = (content) => {
    const features = [];
    const featurePattern = 'feature';
    const featureRegex = new RegExp(`${featurePattern}\\s*\\(\\s*(['"])((?:\\\\\\1|.)*?)\\1\\s*,\\s*\\(\\s*\\)\\s*=>\\s*{`, 'g');
    let featureMatch;
    while ((featureMatch = featureRegex.exec(content)) !== null) {
        const featureTitle = featureMatch[2];
        const featureStartPos = featureMatch.index;
        // Find the closing brace for this feature block
        let openBraces = 1;
        let featureEndPos = featureStartPos + featureMatch[0].length;
        while (openBraces > 0 && featureEndPos < content.length) {
            const char = content[featureEndPos];
            if (char === '{')
                openBraces++;
            if (char === '}')
                openBraces--;
            featureEndPos++;
        }
        if (openBraces === 0) {
            const featureContent = content.substring(featureStartPos, featureEndPos);
            // Extract use cases within this feature
            const useCases = (0, exports.extractUseCases)(featureContent);
            features.push({
                title: featureTitle,
                slug: (0, exports.slugify)(featureTitle),
                useCases: useCases.map(uc => ({
                    title: uc.title,
                    description: uc.description,
                    slug: (0, exports.slugify)(uc.title),
                    content: uc.content
                }))
            });
        }
    }
    return features;
};
exports.extractFeaturesAndUseCases = extractFeaturesAndUseCases;
/**
 * Extract all use cases from content
 */
const extractUseCases = (content) => {
    const useCases = [];
    const useCasePattern = 'usecase';
    const useCaseRegex = new RegExp(`${useCasePattern}\\s*\\(\\s*(['"])((?:\\\\\\1|.)*?)\\1\\s*,\\s*\\(\\s*\\)\\s*=>\\s*{`, 'g');
    let match;
    while ((match = useCaseRegex.exec(content)) !== null) {
        const title = match[2];
        const startPos = match.index;
        // Find the closing brace for this usecase block
        let openBraces = 1;
        let endPos = startPos + match[0].length;
        while (openBraces > 0 && endPos < content.length) {
            const char = content[endPos];
            if (char === '{')
                openBraces++;
            if (char === '}')
                openBraces--;
            endPos++;
        }
        if (openBraces === 0) {
            const useCaseContent = content.substring(startPos, endPos);
            // Extract description if present
            const descriptionPattern = 'description';
            const descriptionRegex = new RegExp(`${descriptionPattern}\\s*\\(\\s*(['"])((?:\\\\\\1|.)*?)\\1\\s*\\)`, 'g');
            const descMatch = descriptionRegex.exec(useCaseContent);
            const description = descMatch ? descMatch[2] : '';
            useCases.push({
                title,
                description,
                content: useCaseContent
            });
        }
    }
    return useCases;
};
exports.extractUseCases = extractUseCases;
/**
 * Process a test file to extract features and use cases
 */
const processTestFile = (testFilePath) => {
    try {
        const content = (0, fs_1.readFileSync)(testFilePath, 'utf8');
        return (0, exports.extractFeaturesAndUseCases)(content);
    }
    catch (error) {
        console.warn(`Error processing test file ${testFilePath}:`, error);
        return [];
    }
};
exports.processTestFile = processTestFile;
/**
 * Convert a single use case to HTML
 */
const useCaseToHtml = (useCase) => {
    const useCaseContent = useCase.content;
    const stepPattern = 'step';
    const screenshotPattern = 'screenshot';
    const stepsTitle = 'Steps';
    // Build HTML content
    let html = `<section id="${useCase.slug}" class="use-case">
    <h3>${(0, exports.escapeHtml)(useCase.title)}</h3>\n`;
    // Add description if present
    if (useCase.description) {
        html += `<p class="description">${(0, exports.escapeHtml)(useCase.description)}</p>\n`;
    }
    html += `<h4>${stepsTitle}</h4>\n<ul class="steps">\n`;
    const stepRegex = /step\s*\(\s*(['"])((?:\\\1|.)*?)\1\s*,/gs;
    let stepMatch;
    while ((stepMatch = stepRegex.exec(useCaseContent)) !== null) {
        const stepName = stepMatch[2].trim();
        html += `<li>${(0, exports.escapeHtml)(stepName)}`;
        // Check if this step block contains a screenshot
        const screenshotMatch = useCaseContent.slice(stepMatch.index).match(new RegExp(`${screenshotPattern}\\(['"]([^'"]+)['"]`));
        if (screenshotMatch) {
            const screenshotName = screenshotMatch[1];
            // Reference the screenshot in the same directory
            html += `\n<figure class="screenshot">
        <img src="${screenshotName}.png" alt="${(0, exports.escapeHtml)(stepName)}" />
        <figcaption>${(0, exports.escapeHtml)(screenshotName)}</figcaption>
      </figure>\n`;
        }
        html += `</li>\n`;
    }
    html += `</ul>\n</section>\n`;
    return html;
};
exports.useCaseToHtml = useCaseToHtml;
/**
 * Convert a feature with its use cases to HTML
 */
const featureToHtml = (feature) => {
    let html = `<section id="${feature.slug}" class="feature">
    <h2>${(0, exports.escapeHtml)(feature.title)}</h2>\n`;
    // Add use cases
    feature.useCases.forEach(useCase => {
        html += (0, exports.useCaseToHtml)(useCase);
    });
    html += `</section>\n`;
    return html;
};
exports.featureToHtml = featureToHtml;
/**
 * Process a test file and generate HTML
 */
const processTestFileToHtml = (testFilePath) => {
    try {
        const features = (0, exports.processTestFile)(testFilePath);
        return features.map(feature => (0, exports.featureToHtml)(feature)).join('\n');
    }
    catch (error) {
        console.warn(`Error processing test file to HTML: ${testFilePath}`, error);
        return '';
    }
};
exports.processTestFileToHtml = processTestFileToHtml;
/**
 * Generate navigation tree structure
 */
const generateNavigation = (featuresByPath, currentPath = '', currentFeature = '', currentUseCase = '') => {
    // Build a tree structure for navigation
    const tree = {};
    // Process all features
    Object.entries(featuresByPath).forEach(([dirPath, features]) => {
        const pathParts = dirPath.split('/').filter(Boolean);
        // Build the directory tree
        let current = tree;
        pathParts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = {
                    _isDir: true,
                    _path: '/' + pathParts.slice(0, index + 1).join('/')
                };
            }
            current = current[part];
        });
        // Add features to this directory
        features.forEach(feature => {
            const featureKey = feature.title;
            current[featureKey] = {
                _isFeature: true,
                _path: dirPath,
                _slug: feature.slug,
                _useCases: feature.useCases.map(uc => ({
                    title: uc.title,
                    slug: uc.slug
                }))
            };
        });
    });
    // Generate HTML for navigation
    function buildNavHtml(obj, indent = 0, path = []) {
        let html = '';
        const indentStr = '  '.repeat(indent);
        // Process keys in sorted order
        Object.keys(obj)
            .filter(key => !key.startsWith('_')) // Skip metadata keys
            .sort()
            .forEach(key => {
            const node = obj[key];
            const newPath = [...path, key];
            if (node._isDir) {
                // Directory node
                html += `${indentStr}<li class="folder">
            <span class="folder-name">${(0, exports.escapeHtml)(key)}</span>
            <ul>\n${buildNavHtml(node, indent + 1, newPath)}${indentStr}  </ul>
          </li>\n`;
            }
            else if (node._isFeature) {
                // Feature node
                const featurePath = node._path;
                const featureSlug = node._slug;
                const useCases = node._useCases || [];
                const isActiveFeature = currentPath === featurePath &&
                    (currentFeature === featureSlug || !currentFeature);
                // Add feature link
                html += `${indentStr}<li class="feature ${isActiveFeature ? 'active' : ''}">
            <a href="${(0, exports.getRelativePath)(currentPath, featurePath)}/index.html#${featureSlug}">${(0, exports.escapeHtml)(key)}</a>`;
                // Add use cases as sub-items
                if (useCases.length > 0) {
                    html += `\n${indentStr}  <ul class="use-cases">\n`;
                    useCases.forEach((uc) => {
                        const isActiveUseCase = isActiveFeature && uc.slug === currentUseCase;
                        html += `${indentStr}    <li class="${isActiveUseCase ? 'active' : ''}">
              <a href="${(0, exports.getRelativePath)(currentPath, featurePath)}/index.html#${uc.slug}">${(0, exports.escapeHtml)(uc.title)}</a>
            </li>\n`;
                    });
                    html += `${indentStr}  </ul>`;
                }
                html += `\n${indentStr}</li>\n`;
            }
        });
        return html;
    }
    return `<nav class="sidebar">
  <div class="sidebar-header">
    <h1>Test Documentation</h1>
  </div>
  <ul class="nav-tree">
    ${buildNavHtml(tree)}
  </ul>
</nav>`;
};
exports.generateNavigation = generateNavigation;
/**
 * Create a feature map by file path for a directory
 */
const createFeaturesByPath = (cypressConfig, config, featureMap) => {
    const featuresByPath = {};
    const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
    // Process each feature directory and test file
    Object.entries(featureMap).forEach(([dirPath, testFiles]) => {
        const features = [];
        // Process all test files in this directory
        testFiles.forEach(testFile => {
            const testFilePath = path.join(testDir, dirPath, testFile);
            const fileFeatures = (0, exports.processTestFile)(testFilePath);
            features.push(...fileFeatures);
        });
        if (features.length > 0) {
            featuresByPath[dirPath] = features;
        }
    });
    return featuresByPath;
};
exports.createFeaturesByPath = createFeaturesByPath;
/**
 * Writes a directory's HTML file to the output directory
 */
const writeDirectoryHtml = (cypressConfig, config, dirPath, features, featuresByPath) => {
    // Define the output file path
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir, dirPath);
    const outputFile = path.join(outputDir, `index.html`);
    // Ensure the directory exists
    (0, file_utils_1.ensureDirectoryExists)(outputDir);
    // Get the directory title
    const dirTitle = dirPath.split('/').pop() || 'Documentation';
    // Generate the HTML content for all features
    const featuresHtml = features.map(feature => (0, exports.featureToHtml)(feature)).join('\n');
    // Wrap content in a container
    const wrappedContent = `<div class="content-wrapper">
    <header>
      <h1>${dirTitle}</h1>
    </header>
    <main class="feature-content">
      ${featuresHtml}
    </main>
  </div>`;
    // Get template path
    const templateDir = path.join(__dirname, '..', '..', 'templates');
    const templatePath = path.join(templateDir, 'feature.html');
    // Calculate the relative path to CSS
    const cssRelativePath = path.relative(outputDir, path.join(cypressConfig.projectRoot, config.outDir, 'styles'));
    // Ensure path uses forward slashes for URLs
    const cssPath = `${cssRelativePath}/main.css`.replace(/\\/g, '/');
    // Generate navigation
    const navigation = (0, exports.generateNavigation)(featuresByPath, dirPath);
    // Process template
    const html = (0, exports.processTemplate)(templatePath, {
        'title': dirTitle,
        'content': wrappedContent,
        'navigation': navigation,
        'css_path': cssPath
    });
    // Write the HTML file
    (0, fs_1.writeFileSync)(outputFile, html);
};
exports.writeDirectoryHtml = writeDirectoryHtml;
/**
 * Writes the index HTML file
 */
const writeIndexHtml = (cypressConfig, config, featuresByPath) => {
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir);
    const outputFile = path.join(outputDir, 'index.html');
    // Get template path
    const templateDir = path.join(__dirname, '..', '..', 'templates');
    const templatePath = path.join(templateDir, 'index.html');
    // Generate navigation
    const navigation = (0, exports.generateNavigation)(featuresByPath);
    // Process template
    const html = (0, exports.processTemplate)(templatePath, {
        'title': 'Test Documentation',
        'content': '<div class="welcome"><h2>Welcome to the Test Documentation</h2><p>Select a feature from the navigation menu to view its documentation.</p></div>',
        'navigation': navigation,
        'css_path': 'styles/main.css'
    });
    // Write the HTML file
    (0, fs_1.writeFileSync)(outputFile, html);
};
exports.writeIndexHtml = writeIndexHtml;
/**
 * Copies CSS files to the output directory
 */
const copyCssFiles = (cypressConfig, config) => {
    const templateDir = path.join(__dirname, '..', '..', 'templates');
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir, 'styles');
    (0, file_utils_1.ensureDirectoryExists)(outputDir);
    const cssFiles = ['main.css', 'theme.css'];
    cssFiles.forEach(file => {
        const source = path.join(templateDir, 'styles', file);
        const destination = path.join(outputDir, file);
        try {
            (0, fs_1.writeFileSync)(destination, (0, fs_1.readFileSync)(source, 'utf8'));
        }
        catch (error) {
            console.warn(`Failed to copy CSS file ${file}:`, error);
        }
    });
};
exports.copyCssFiles = copyCssFiles;
