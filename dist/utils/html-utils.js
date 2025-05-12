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
exports.copyCssFiles = exports.writeMainIndexHtml = exports.writeDirectoryIndexHtml = exports.writeFeatureHtml = exports.collectAllFeatures = exports.generateNavigation = exports.processTestFileToHtml = exports.featureToHtml = exports.useCaseToHtml = exports.alternativeFlowToHtml = exports.assertionToHtml = exports.stepToHtml = exports.processTestFile = exports.extractAlternativeFlows = exports.extractAssertions = exports.extractSteps = exports.extractUseCasesWithSteps = exports.extractFeaturesAndUseCases = exports.processTemplate = exports.getRelativePath = exports.slugify = exports.escapeHtml = void 0;
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
const extractFeaturesAndUseCases = (content, dirPath, filePath) => {
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
            const useCases = (0, exports.extractUseCasesWithSteps)(featureContent);
            features.push({
                title: featureTitle,
                slug: (0, exports.slugify)(featureTitle),
                useCases,
                dirPath,
                filePath
            });
        }
    }
    return features;
};
exports.extractFeaturesAndUseCases = extractFeaturesAndUseCases;
/**
 * Extract use cases with steps and alternative flows
 */
const extractUseCasesWithSteps = (content) => {
    const useCases = [];
    const useCasePattern = 'usecase';
    const useCaseRegex = new RegExp(`${useCasePattern}\\s*\\(\\s*(['"])((?:\\\\\\1|.)*?)\\1\\s*,\\s*\\(\\s*\\)\\s*=>\\s*{`, 'g');
    let useCaseMatch;
    while ((useCaseMatch = useCaseRegex.exec(content)) !== null) {
        const useCaseTitle = useCaseMatch[2];
        const useCaseStartPos = useCaseMatch.index;
        // Find the closing brace for this usecase block
        let openBraces = 1;
        let useCaseEndPos = useCaseStartPos + useCaseMatch[0].length;
        while (openBraces > 0 && useCaseEndPos < content.length) {
            const char = content[useCaseEndPos];
            if (char === '{')
                openBraces++;
            if (char === '}')
                openBraces--;
            useCaseEndPos++;
        }
        if (openBraces === 0) {
            const useCaseContent = content.substring(useCaseStartPos, useCaseEndPos);
            // Extract description
            const descriptionPattern = 'description';
            const descriptionRegex = new RegExp(`${descriptionPattern}\\s*\\(\\s*(['"])((?:\\\\\\1|.)*?)\\1\\s*\\)`, 'g');
            const descMatch = descriptionRegex.exec(useCaseContent);
            const description = descMatch ? descMatch[2] : '';
            // Extract steps for the main flow
            const steps = (0, exports.extractSteps)(useCaseContent);
            // Extract assertions (it blocks)
            const assertions = (0, exports.extractAssertions)(useCaseContent);
            // Extract alternative flows
            const alternativeFlows = (0, exports.extractAlternativeFlows)(useCaseContent);
            useCases.push({
                title: useCaseTitle,
                description,
                slug: (0, exports.slugify)(useCaseTitle),
                content: useCaseContent,
                steps,
                assertions,
                alternativeFlows
            });
        }
    }
    return useCases;
};
exports.extractUseCasesWithSteps = extractUseCasesWithSteps;
/**
 * Extract steps from a use case or alternative flow content
 */
const extractSteps = (content) => {
    const steps = [];
    const stepPattern = 'step';
    const stepRegex = new RegExp(`${stepPattern}\\s*\\(\\s*(['"])((?:\\\\\\1|.)*?)\\1\\s*,\\s*\\(\\s*\\)\\s*=>\\s*{`, 'g');
    let stepMatch;
    while ((stepMatch = stepRegex.exec(content)) !== null) {
        const stepTitle = stepMatch[2];
        const stepStartPos = stepMatch.index;
        // Find the closing brace for this step block
        let openBraces = 1;
        let stepEndPos = stepStartPos + stepMatch[0].length;
        while (openBraces > 0 && stepEndPos < content.length) {
            const char = content[stepEndPos];
            if (char === '{')
                openBraces++;
            if (char === '}')
                openBraces--;
            stepEndPos++;
        }
        if (openBraces === 0) {
            const stepContent = content.substring(stepStartPos, stepEndPos);
            // Check for screenshot
            const screenshotPattern = 'screenshot';
            const screenshotRegex = new RegExp(`${screenshotPattern}\\s*\\(\\s*(['"])((?:\\\\\\1|.)*?)\\1\\s*\\)`, 'g');
            const screenshotMatch = screenshotRegex.exec(stepContent);
            const screenshotName = screenshotMatch ? screenshotMatch[2] : undefined;
            steps.push({
                title: stepTitle,
                content: stepContent,
                screenshotName
            });
        }
    }
    return steps;
};
exports.extractSteps = extractSteps;
/**
 * Extract assertions (it blocks) from a use case or alternative flow content
 */
const extractAssertions = (content) => {
    const assertions = [];
    // Match 'it' blocks but not ones inside alternative flows
    // We need to be more careful to avoid matching 'it' blocks inside alternatives
    const itPattern = '\\bit\\s*\\(\\s*([\'"])((?:\\\\\\1|.)*?)\\1\\s*,\\s*\\(\\s*\\)\\s*=>\\s*{';
    const alternativePattern = 'alternative\\s*\\(';
    // First, find all alternative positions to exclude
    const alternativeRegex = new RegExp(alternativePattern, 'g');
    const alternativePositions = [];
    let alternativeMatch;
    while ((alternativeMatch = alternativeRegex.exec(content)) !== null) {
        const start = alternativeMatch.index;
        // Find closing brace for this alternative
        let openBraces = 0; // Will be incremented when we find the first {
        let end = start;
        // Find the opening brace first
        let foundOpeningBrace = false;
        while (!foundOpeningBrace && end < content.length) {
            if (content[end] === '{') {
                foundOpeningBrace = true;
                openBraces = 1;
            }
            end++;
        }
        // Now find the matching closing brace
        while (openBraces > 0 && end < content.length) {
            const char = content[end];
            if (char === '{')
                openBraces++;
            if (char === '}')
                openBraces--;
            end++;
        }
        alternativePositions.push({ start, end });
    }
    // Now extract 'it' blocks outside of alternatives
    const itRegex = new RegExp(itPattern, 'g');
    let itMatch;
    while ((itMatch = itRegex.exec(content)) !== null) {
        const itIndex = itMatch.index;
        // Check if this 'it' is inside an alternative
        const isInsideAlternative = alternativePositions.some(pos => itIndex > pos.start && itIndex < pos.end);
        if (!isInsideAlternative) {
            const itTitle = itMatch[2];
            const itStartPos = itMatch.index;
            // Find the closing brace for this 'it' block
            let openBraces = 1;
            let itEndPos = itStartPos + itMatch[0].length;
            while (openBraces > 0 && itEndPos < content.length) {
                const char = content[itEndPos];
                if (char === '{')
                    openBraces++;
                if (char === '}')
                    openBraces--;
                itEndPos++;
            }
            if (openBraces === 0) {
                const itContent = content.substring(itStartPos, itEndPos);
                assertions.push({
                    title: itTitle,
                    content: itContent
                });
            }
        }
    }
    return assertions;
};
exports.extractAssertions = extractAssertions;
/**
 * Extract alternative flows from a use case content
 */
const extractAlternativeFlows = (content) => {
    const alternativeFlows = [];
    const alternativePattern = 'alternative';
    const alternativeRegex = new RegExp(`${alternativePattern}\\s*\\(\\s*(['"])((?:\\\\\\1|.)*?)\\1\\s*,\\s*\\(\\s*\\)\\s*=>\\s*{`, 'g');
    let alternativeMatch;
    while ((alternativeMatch = alternativeRegex.exec(content)) !== null) {
        const alternativeTitle = alternativeMatch[2];
        const alternativeStartPos = alternativeMatch.index;
        // Find the closing brace for this alternative block
        let openBraces = 1;
        let alternativeEndPos = alternativeStartPos + alternativeMatch[0].length;
        while (openBraces > 0 && alternativeEndPos < content.length) {
            const char = content[alternativeEndPos];
            if (char === '{')
                openBraces++;
            if (char === '}')
                openBraces--;
            alternativeEndPos++;
        }
        if (openBraces === 0) {
            const alternativeContent = content.substring(alternativeStartPos, alternativeEndPos);
            // Extract steps for this alternative flow
            const steps = (0, exports.extractSteps)(alternativeContent);
            // Extract assertions for this alternative flow
            const assertions = (0, exports.extractAssertions)(alternativeContent);
            alternativeFlows.push({
                title: alternativeTitle,
                slug: (0, exports.slugify)(alternativeTitle),
                steps,
                assertions
            });
        }
    }
    return alternativeFlows;
};
exports.extractAlternativeFlows = extractAlternativeFlows;
/**
 * Process a test file to extract features and use cases
 */
const processTestFile = (testFilePath, dirPath) => {
    try {
        const content = (0, fs_1.readFileSync)(testFilePath, 'utf8');
        return (0, exports.extractFeaturesAndUseCases)(content, dirPath, testFilePath);
    }
    catch (error) {
        console.warn(`Error processing test file ${testFilePath}:`, error);
        return [];
    }
};
exports.processTestFile = processTestFile;
/**
 * Convert a single step to HTML
 */
const stepToHtml = (step, index) => {
    let html = `<li class="step">
    <span class="step-title">${(0, exports.escapeHtml)(step.title)}</span>`;
    // Add screenshot if available
    if (step.screenshotName) {
        html += `\n<figure class="screenshot">
      <img src="${step.screenshotName}.png" alt="${(0, exports.escapeHtml)(step.title)}" />
      <figcaption>${(0, exports.escapeHtml)(step.screenshotName)}</figcaption>
    </figure>\n`;
    }
    html += `</li>\n`;
    return html;
};
exports.stepToHtml = stepToHtml;
/**
 * Convert an assertion to HTML
 */
const assertionToHtml = (assertion, index) => {
    return `<li class="assertion">
    <span class="assertion-title">${(0, exports.escapeHtml)(assertion.title)}</span>
  </li>\n`;
};
exports.assertionToHtml = assertionToHtml;
/**
 * Convert an alternative flow to HTML
 */
const alternativeFlowToHtml = (flow, index) => {
    let html = `<div id="${flow.slug}" class="alternative-flow">
    <h4>${(0, exports.escapeHtml)(flow.title)}</h4>\n`;
    // Add steps
    if (flow.steps.length > 0) {
        html += `<ol class="steps alternative-steps">\n`;
        flow.steps.forEach((step, i) => {
            html += (0, exports.stepToHtml)(step, i);
        });
        html += `</ol>\n`;
    }
    html += `</div>\n`;
    return html;
};
exports.alternativeFlowToHtml = alternativeFlowToHtml;
/**
 * Convert a single use case to HTML
 */
const useCaseToHtml = (useCase) => {
    // Build HTML content
    let html = `<section id="${useCase.slug}" class="use-case">
    <h3>${(0, exports.escapeHtml)(useCase.title)}</h3>\n`;
    // Add description if present
    if (useCase.description) {
        html += `<p class="description">${(0, exports.escapeHtml)(useCase.description)}</p>\n`;
    }
    // Add main flow header
    html += `<div class="main-flow">`;
    // Add steps
    if (useCase.steps.length > 0) {
        html += `<ol class="steps main-steps">\n`;
        useCase.steps.forEach((step, index) => {
            html += (0, exports.stepToHtml)(step, index);
        });
        html += `</ol>\n`;
    }
    html += `</div>\n`; // Close main-flow div
    // Add alternative flows
    if (useCase.alternativeFlows.length > 0) {
        html += `<div class="alternative-flows">
      <h4>Vaihtoehtoiset kulut</h4>\n`;
        useCase.alternativeFlows.forEach((flow, index) => {
            html += (0, exports.alternativeFlowToHtml)(flow, index);
        });
        html += `</div>\n`;
    }
    html += `</section>\n`;
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
const processTestFileToHtml = (testFilePath, dirPath) => {
    try {
        return (0, exports.processTestFile)(testFilePath, dirPath);
    }
    catch (error) {
        console.warn(`Error processing test file to HTML: ${testFilePath}`, error);
        return [];
    }
};
exports.processTestFileToHtml = processTestFileToHtml;
/**
 * Generate navigation tree structure
 */
const generateNavigation = (allFeatures, currentDirPath = '', currentFeatureSlug = '', currentUseCase = '') => {
    // Build a tree structure for navigation
    const dirTree = {};
    // Group features by directory
    allFeatures.forEach(feature => {
        const dirPath = feature.dirPath;
        const pathParts = dirPath.split('/').filter(Boolean);
        // Build the directory tree
        let current = dirTree;
        pathParts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = {
                    _isDir: true,
                    _path: '/' + pathParts.slice(0, index + 1).join('/')
                };
            }
            current = current[part];
        });
        // Add feature to this directory
        current[feature.title] = {
            _isFeature: true,
            _path: dirPath,
            _slug: feature.slug,
            _useCases: feature.useCases.map(uc => ({
                title: uc.title,
                slug: uc.slug
            }))
        };
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
                const isActiveFeature = currentDirPath === featurePath &&
                    (currentFeatureSlug === featureSlug || !currentFeatureSlug);
                // Get relative path to feature page
                const relativePath = (0, exports.getRelativePath)(currentDirPath, `${featurePath}/${featureSlug}`);
                // Add feature link
                html += `${indentStr}<li class="feature ${isActiveFeature ? 'active' : ''}">
            <a href="${relativePath}.html">${(0, exports.escapeHtml)(key)}</a>`;
                // Add use cases as sub-items
                if (useCases.length > 0) {
                    html += `\n${indentStr}  <ul class="use-cases">\n`;
                    useCases.forEach((uc) => {
                        const isActiveUseCase = isActiveFeature && uc.slug === currentUseCase;
                        html += `${indentStr}    <li class="${isActiveUseCase ? 'active' : ''}">
              <a href="${relativePath}.html#${uc.slug}">${(0, exports.escapeHtml)(uc.title)}</a>`;
                        // Add alternative flows if any
                        if (uc.alternativeFlows && uc.alternativeFlows.length > 0) {
                            html += `\n${indentStr}      <ul class="alternative-flows-nav">\n`;
                            uc.alternativeFlows.forEach((alt) => {
                                html += `${indentStr}        <li>
                  <a href="${relativePath}.html#${alt.slug}" class="alternative-flow-link">
                    ${(0, exports.escapeHtml)(alt.title)}
                  </a>
                </li>\n`;
                            });
                            html += `${indentStr}      </ul>\n`;
                        }
                        html += `${indentStr}    </li>\n`;
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
    ${buildNavHtml(dirTree)}
  </ul>
</nav>`;
};
exports.generateNavigation = generateNavigation;
/**
 * Create a collection of all features across all directories
 */
const collectAllFeatures = (cypressConfig, config, featureMap) => {
    const allFeatures = [];
    const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
    // Process each feature directory and test file
    Object.entries(featureMap).forEach(([dirPath, testFiles]) => {
        // Process all test files in this directory
        testFiles.forEach(testFile => {
            const testFilePath = path.join(testDir, dirPath, testFile);
            const features = (0, exports.processTestFile)(testFilePath, dirPath);
            allFeatures.push(...features);
        });
    });
    return allFeatures;
};
exports.collectAllFeatures = collectAllFeatures;
/**
 * Write an individual feature page
 */
const writeFeatureHtml = (cypressConfig, config, feature, allFeatures) => {
    // Define the output file path
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir, feature.dirPath);
    const outputFile = path.join(outputDir, `${feature.slug}.html`);
    // Ensure the directory exists
    (0, file_utils_1.ensureDirectoryExists)(outputDir);
    // Generate the HTML content for the feature
    const featureHtml = (0, exports.featureToHtml)(feature);
    // Wrap content in a container
    const wrappedContent = `<div class="content-wrapper">
    <header>
      <h1>${(0, exports.escapeHtml)(feature.title)}</h1>
    </header>
    <main class="feature-content">
      ${featureHtml}
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
    const navigation = (0, exports.generateNavigation)(allFeatures, feature.dirPath, feature.slug);
    // Process template
    const html = (0, exports.processTemplate)(templatePath, {
        'title': feature.title,
        'content': wrappedContent,
        'navigation': navigation,
        'css_path': cssPath
    });
    // Write the HTML file
    (0, fs_1.writeFileSync)(outputFile, html);
};
exports.writeFeatureHtml = writeFeatureHtml;
/**
 * Write a directory index page that lists the features in that directory
 */
const writeDirectoryIndexHtml = (cypressConfig, config, dirPath, features, allFeatures) => {
    // Define the output file path
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir, dirPath);
    const outputFile = path.join(outputDir, `index.html`);
    // Ensure the directory exists
    (0, file_utils_1.ensureDirectoryExists)(outputDir);
    // Get the directory title
    const dirTitle = dirPath.split('/').pop() || 'Documentation';
    // Generate the HTML content for the feature list
    let featuresListHtml = `<div class="feature-list">
    <h2>Features in ${(0, exports.escapeHtml)(dirTitle)}</h2>
    <ul>`;
    features.forEach(feature => {
        featuresListHtml += `\n      <li><a href="${feature.slug}.html">${(0, exports.escapeHtml)(feature.title)}</a></li>`;
    });
    featuresListHtml += `\n    </ul>
  </div>`;
    // Wrap content in a container
    const wrappedContent = `<div class="content-wrapper">
    <header>
      <h1>${dirTitle}</h1>
    </header>
    <main class="feature-content">
      ${featuresListHtml}
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
    const navigation = (0, exports.generateNavigation)(allFeatures, dirPath);
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
exports.writeDirectoryIndexHtml = writeDirectoryIndexHtml;
/**
 * Writes the main index HTML file
 */
const writeMainIndexHtml = (cypressConfig, config, allFeatures) => {
    const outputDir = path.join(cypressConfig.projectRoot, config.outDir);
    const outputFile = path.join(outputDir, 'index.html');
    // Get template path
    const templateDir = path.join(__dirname, '..', '..', 'templates');
    const templatePath = path.join(templateDir, 'index.html');
    // Generate feature list content
    let featuresHtml = '';
    // Group features by directory
    const featuresByDir = {};
    allFeatures.forEach(feature => {
        if (!featuresByDir[feature.dirPath]) {
            featuresByDir[feature.dirPath] = [];
        }
        featuresByDir[feature.dirPath].push(feature);
    });
    // Generate HTML for feature list by directory
    Object.entries(featuresByDir).forEach(([dirPath, dirFeatures]) => {
        const dirName = dirPath.split('/').pop() || dirPath;
        featuresHtml += `<div class="directory">
      <h2>${(0, exports.escapeHtml)(dirName)}</h2>
      <ul>`;
        dirFeatures.forEach(feature => {
            featuresHtml += `
        <li><a href="${dirPath}/${feature.slug}.html">${(0, exports.escapeHtml)(feature.title)}</a></li>`;
        });
        featuresHtml += `
      </ul>
    </div>`;
    });
    const welcome = '<div class="welcome"><h2>Test Documentation</h2><p>Select a feature from the navigation menu to view its documentation.</p></div>';
    const content = featuresHtml ? welcome + featuresHtml : welcome;
    // Generate navigation
    const navigation = (0, exports.generateNavigation)(allFeatures);
    // Process template
    const html = (0, exports.processTemplate)(templatePath, {
        'title': 'Test Documentation',
        'content': content,
        'navigation': navigation,
        'css_path': 'styles/main.css'
    });
    // Write the HTML file
    (0, fs_1.writeFileSync)(outputFile, html);
};
exports.writeMainIndexHtml = writeMainIndexHtml;
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
