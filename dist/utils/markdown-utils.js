"use strict";
/// <reference types="cypress" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSidebar = exports.ucToMarkdown = void 0;
/**
 * Converts a Cypress test file content to markdown format.
 * Modified to reference screenshots in the same directory as the markdown file.
 *
 * @param cypressConfig The Cypress configuration object
 * @param config The plugin configuration
 * @param featurePath The path to the feature being documented
 * @param content The content of the Cypress test file
 * @returns Markdown formatted content
 */
const ucToMarkdown = (cypressConfig, config, featurePath, content) => {
    const useCasePattern = 'usecase';
    const stepPattern = 'step';
    const screenshotPattern = 'screenshot';
    const descriptionPattern = 'description';
    const stepsTitle = 'Steps';
    const useCaseRegex = new RegExp(`${useCasePattern}\\(['"]([^'"]+)['"]`);
    const useCaseMatch = content.match(useCaseRegex);
    const useCaseTitle = useCaseMatch === null || useCaseMatch === void 0 ? void 0 : useCaseMatch[1];
    if (!useCaseTitle)
        return null;
    // Build markdown
    let markdown = `## ${useCaseTitle}\n\n`;
    // Extract description
    const descriptionRegex = new RegExp(`${descriptionPattern}\\s*\\(\\s*['"]([^'"]+)['"]`);
    const descriptionMatch = content.match(descriptionRegex);
    if (descriptionMatch === null || descriptionMatch === void 0 ? void 0 : descriptionMatch[1]) {
        markdown += `${descriptionMatch[1]}\n\n`;
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
            // Reference the screenshot in the same directory
            // The path doesn't need to include any directory structure since 
            // the screenshot will be in the same directory as the markdown file
            markdown += `\n![${screenshotName}](${screenshotName}.png)\n\n`;
        }
    }
    return markdown;
};
exports.ucToMarkdown = ucToMarkdown;
/**
 * Generates a sidebar from the feature map.
 *
 * @param features The feature map
 * @returns Markdown for the sidebar
 */
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
