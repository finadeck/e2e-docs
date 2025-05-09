import { Config, FeatureMap } from '../types';
/**
 * Escapes HTML special characters
 */
export declare const escapeHtml: (text: string) => string;
/**
 * Creates a URL-friendly slug from a string
 */
export declare const slugify: (text: string) => string;
/**
 * Helper function to calculate relative path between current and target
 */
export declare const getRelativePath: (from: string, to: string) => string;
/**
 * Reads an HTML template file and replaces placeholders
 *
 * @param templatePath Path to the template file
 * @param replacements Object with placeholder replacements
 * @returns Processed template content
 */
export declare const processTemplate: (templatePath: string, replacements: Record<string, string>) => string;
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
export declare const extractFeaturesAndUseCases: (content: string) => FeatureData[];
/**
 * Extract all use cases from content
 */
export declare const extractUseCases: (content: string) => {
    title: string;
    description: string;
    content: string;
}[];
/**
 * Process a test file to extract features and use cases
 */
export declare const processTestFile: (testFilePath: string) => FeatureData[];
/**
 * Convert a single use case to HTML
 */
export declare const useCaseToHtml: (useCase: UseCaseData) => string;
/**
 * Convert a feature with its use cases to HTML
 */
export declare const featureToHtml: (feature: FeatureData) => string;
/**
 * Process a test file and generate HTML
 */
export declare const processTestFileToHtml: (testFilePath: string) => string;
/**
 * Generate navigation tree structure
 */
export declare const generateNavigation: (featuresByPath: Record<string, FeatureData[]>, currentPath?: string, currentFeature?: string, currentUseCase?: string) => string;
/**
 * Create a feature map by file path for a directory
 */
export declare const createFeaturesByPath: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featureMap: FeatureMap) => Record<string, FeatureData[]>;
/**
 * Writes a directory's HTML file to the output directory
 */
export declare const writeDirectoryHtml: (cypressConfig: Cypress.PluginConfigOptions, config: Config, dirPath: string, features: FeatureData[], featuresByPath: Record<string, FeatureData[]>) => void;
/**
 * Writes the index HTML file
 */
export declare const writeIndexHtml: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featuresByPath: Record<string, FeatureData[]>) => void;
/**
 * Copies CSS files to the output directory
 */
export declare const copyCssFiles: (cypressConfig: Cypress.PluginConfigOptions, config: Config) => void;
