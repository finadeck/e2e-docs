// src/utils/html-utils.ts
/// <reference types="cypress" />

import * as path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Config, FeatureMap, TreeNode } from '../types';
import { ensureDirectoryExists } from './file-utils';

/**
 * Escapes HTML special characters
 */
export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Creates a URL-friendly slug from a string
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

/**
 * Helper function to calculate relative path between current and target
 */
export const getRelativePath = (from: string, to: string): string => {
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
    } else {
      break;
    }
  }
  
  // Build relative path
  const upCount = fromParts.length - commonLength;
  const relativeParts = [...Array(upCount).fill('..'), ...toParts.slice(commonLength)];
  
  // Return the relative path, defaulting to current directory if same path
  return relativeParts.length ? relativeParts.join('/') : '.';
};

/**
 * Reads an HTML template file and replaces placeholders
 * 
 * @param templatePath Path to the template file
 * @param replacements Object with placeholder replacements
 * @returns Processed template content
 */
export const processTemplate = (
  templatePath: string,
  replacements: Record<string, string>
): string => {
  let template = readFileSync(templatePath, 'utf8');
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g');
    template = template.replace(regex, value);
  });
  
  return template;
};

/**
 * Extract features and their use cases from a test file
 */
export interface FeatureData {
  title: string;
  slug: string;
  useCases: UseCaseData[];
}

export interface UseCaseData {
  title: string;
  description: string;
  slug: string;
  content: string;
}

/**
 * Extract all features and their use cases from a Cypress test file
 */
export const extractFeaturesAndUseCases = (content: string): FeatureData[] => {
  const features: FeatureData[] = [];
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
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      featureEndPos++;
    }
    
    if (openBraces === 0) {
      const featureContent = content.substring(featureStartPos, featureEndPos);
      
      // Extract use cases within this feature
      const useCases = extractUseCases(featureContent);
      
      features.push({
        title: featureTitle,
        slug: slugify(featureTitle),
        useCases: useCases.map(uc => ({
          title: uc.title,
          description: uc.description,
          slug: slugify(uc.title),
          content: uc.content
        }))
      });
    }
  }
  
  return features;
};

/**
 * Extract all use cases from content
 */
export const extractUseCases = (content: string): { title: string; description: string; content: string }[] => {
  const useCases: { title: string; description: string; content: string }[] = [];
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
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
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

/**
 * Process a test file to extract features and use cases
 */
export const processTestFile = (
  testFilePath: string
): FeatureData[] => {
  try {
    const content = readFileSync(testFilePath, 'utf8');
    return extractFeaturesAndUseCases(content);
  } catch (error) {
    console.warn(`Error processing test file ${testFilePath}:`, error);
    return [];
  }
};

/**
 * Convert a single use case to HTML
 */
export const useCaseToHtml = (useCase: UseCaseData): string => {
  const useCaseContent = useCase.content;
  const stepPattern = 'step';
  const screenshotPattern = 'screenshot';
  const stepsTitle = 'Steps';

  // Build HTML content
  let html = `<section id="${useCase.slug}" class="use-case">
    <h3>${escapeHtml(useCase.title)}</h3>\n`;

  // Add description if present
  if (useCase.description) {
    html += `<p class="description">${escapeHtml(useCase.description)}</p>\n`;
  }

  html += `<h4>${stepsTitle}</h4>\n<ul class="steps">\n`;

  const stepRegex = /step\s*\(\s*(['"])((?:\\\1|.)*?)\1\s*,/gs;
  let stepMatch;

  while ((stepMatch = stepRegex.exec(useCaseContent)) !== null) {
    const stepName = stepMatch[2].trim();
    html += `<li>${escapeHtml(stepName)}`;

    // Check if this step block contains a screenshot
    const screenshotMatch = useCaseContent.slice(stepMatch.index).match(new RegExp(`${screenshotPattern}\\(['"]([^'"]+)['"]`));
    if (screenshotMatch) {
      const screenshotName = screenshotMatch[1];
      
      // Reference the screenshot in the same directory
      html += `\n<figure class="screenshot">
        <img src="${screenshotName}.png" alt="${escapeHtml(stepName)}" />
        <figcaption>${escapeHtml(screenshotName)}</figcaption>
      </figure>\n`;
    }
    
    html += `</li>\n`;
  }

  html += `</ul>\n</section>\n`;
  return html;
};

/**
 * Convert a feature with its use cases to HTML
 */
export const featureToHtml = (feature: FeatureData): string => {
  let html = `<section id="${feature.slug}" class="feature">
    <h2>${escapeHtml(feature.title)}</h2>\n`;
    
  // Add use cases
  feature.useCases.forEach(useCase => {
    html += useCaseToHtml(useCase);
  });
  
  html += `</section>\n`;
  return html;
};

/**
 * Process a test file and generate HTML
 */
export const processTestFileToHtml = (testFilePath: string): string => {
  try {
    const features = processTestFile(testFilePath);
    return features.map(feature => featureToHtml(feature)).join('\n');
  } catch (error) {
    console.warn(`Error processing test file to HTML: ${testFilePath}`, error);
    return '';
  }
};

/**
 * Generate navigation tree structure
 */
export const generateNavigation = (
  featuresByPath: Record<string, FeatureData[]>,
  currentPath: string = '',
  currentFeature: string = '',
  currentUseCase: string = ''
): string => {
  // Build a tree structure for navigation
  const tree: { [key: string]: any } = {};
  
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
  function buildNavHtml(obj: any, indent: number = 0, path: string[] = []): string {
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
            <span class="folder-name">${escapeHtml(key)}</span>
            <ul>\n${buildNavHtml(node, indent + 1, newPath)}${indentStr}  </ul>
          </li>\n`;
        } else if (node._isFeature) {
          // Feature node
          const featurePath = node._path;
          const featureSlug = node._slug;
          const useCases = node._useCases || [];
          const isActiveFeature = currentPath === featurePath && 
                                 (currentFeature === featureSlug || !currentFeature);
          
          // Add feature link
          html += `${indentStr}<li class="feature ${isActiveFeature ? 'active' : ''}">
            <a href="${getRelativePath(currentPath, featurePath)}/index.html#${featureSlug}">${escapeHtml(key)}</a>`;
          
          // Add use cases as sub-items
          if (useCases.length > 0) {
            html += `\n${indentStr}  <ul class="use-cases">\n`;
            
            useCases.forEach((uc: any) => {
              const isActiveUseCase = isActiveFeature && uc.slug === currentUseCase;
              html += `${indentStr}    <li class="${isActiveUseCase ? 'active' : ''}">
              <a href="${getRelativePath(currentPath, featurePath)}/index.html#${uc.slug}">${escapeHtml(uc.title)}</a>
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

/**
 * Create a feature map by file path for a directory
 */
export const createFeaturesByPath = (cypressConfig: Cypress.PluginConfigOptions, config: Config, featureMap: FeatureMap): Record<string, FeatureData[]> => {
  const featuresByPath: Record<string, FeatureData[]> = {};
  const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
  
  // Process each feature directory and test file
  Object.entries(featureMap).forEach(([dirPath, testFiles]) => {
    const features: FeatureData[] = [];
    
    // Process all test files in this directory
    testFiles.forEach(testFile => {
      const testFilePath = path.join(testDir, dirPath, testFile);
      const fileFeatures = processTestFile(testFilePath);
      features.push(...fileFeatures);
    });
    
    if (features.length > 0) {
      featuresByPath[dirPath] = features;
    }
  });
  
  return featuresByPath;
};

/**
 * Writes a directory's HTML file to the output directory
 */
export const writeDirectoryHtml = (
  cypressConfig: Cypress.PluginConfigOptions, 
  config: Config,
  dirPath: string,
  features: FeatureData[],
  featuresByPath: Record<string, FeatureData[]>
): void => {
  // Define the output file path
  const outputDir = path.join(cypressConfig.projectRoot, config.outDir, dirPath);
  const outputFile = path.join(outputDir, `index.html`);

  // Ensure the directory exists
  ensureDirectoryExists(outputDir);

  // Get the directory title
  const dirTitle = dirPath.split('/').pop() || 'Documentation';

  // Generate the HTML content for all features
  const featuresHtml = features.map(feature => featureToHtml(feature)).join('\n');
  
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
  const navigation = generateNavigation(featuresByPath, dirPath);

  // Process template
  const html = processTemplate(templatePath, {
    'title': dirTitle,
    'content': wrappedContent,
    'navigation': navigation,
    'css_path': cssPath
  });

  // Write the HTML file
  writeFileSync(outputFile, html);
};

/**
 * Writes the index HTML file
 */
export const writeIndexHtml = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config,
  featuresByPath: Record<string, FeatureData[]>
): void => {
  const outputDir = path.join(cypressConfig.projectRoot, config.outDir);
  const outputFile = path.join(outputDir, 'index.html');
  
  // Get template path
  const templateDir = path.join(__dirname, '..', '..', 'templates');
  const templatePath = path.join(templateDir, 'index.html');

  // Generate navigation
  const navigation = generateNavigation(featuresByPath);

  // Process template
  const html = processTemplate(templatePath, {
    'title': 'Test Documentation',
    'content': '<div class="welcome"><h2>Welcome to the Test Documentation</h2><p>Select a feature from the navigation menu to view its documentation.</p></div>',
    'navigation': navigation,
    'css_path': 'styles/main.css'
  });

  // Write the HTML file
  writeFileSync(outputFile, html);
};

/**
 * Copies CSS files to the output directory
 */
export const copyCssFiles = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config
): void => {
  const templateDir = path.join(__dirname, '..', '..', 'templates');
  const outputDir = path.join(cypressConfig.projectRoot, config.outDir, 'styles');
  
  ensureDirectoryExists(outputDir);
  
  const cssFiles = ['main.css', 'theme.css'];
  cssFiles.forEach(file => {
    const source = path.join(templateDir, 'styles', file);
    const destination = path.join(outputDir, file);
    
    try {
      writeFileSync(destination, readFileSync(source, 'utf8'));
    } catch (error) {
      console.warn(`Failed to copy CSS file ${file}:`, error);
    }
  });
};