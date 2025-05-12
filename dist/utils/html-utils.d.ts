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
    dirPath: string;
    filePath?: string;
}
export interface AlternativeFlowData {
    title: string;
    slug: string;
    steps: StepData[];
    assertions: AssertionData[];
}
export interface UseCaseData {
    title: string;
    description: string;
    slug: string;
    content: string;
    steps: StepData[];
    assertions: AssertionData[];
    alternativeFlows: AlternativeFlowData[];
}
export interface StepData {
    title: string;
    content: string;
    screenshotName?: string;
}
export interface AssertionData {
    title: string;
    content: string;
}
/**
 * Extract all features and their use cases from a Cypress test file
 */
export declare const extractFeaturesAndUseCases: (content: string, dirPath: string, filePath?: string) => FeatureData[];
/**
 * Extract use cases with steps and alternative flows
 */
export declare const extractUseCasesWithSteps: (content: string) => UseCaseData[];
/**
 * Extract steps from a use case or alternative flow content
 */
export declare const extractSteps: (content: string) => StepData[];
/**
 * Extract assertions (it blocks) from a use case or alternative flow content
 */
export declare const extractAssertions: (content: string) => AssertionData[];
/**
 * Extract alternative flows from a use case content
 */
export declare const extractAlternativeFlows: (content: string) => AlternativeFlowData[];
/**
 * Process a test file to extract features and use cases
 */
export declare const processTestFile: (testFilePath: string, dirPath: string) => FeatureData[];
/**
 * Convert a single step to HTML
 */
export declare const stepToHtml: (step: StepData, index: number) => string;
/**
 * Convert an assertion to HTML
 */
export declare const assertionToHtml: (assertion: AssertionData, index: number) => string;
/**
 * Convert an alternative flow to HTML
 */
export declare const alternativeFlowToHtml: (flow: AlternativeFlowData, index: number) => string;
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
export declare const processTestFileToHtml: (testFilePath: string, dirPath: string) => FeatureData[];
/**
 * Generate navigation tree structure
 */
export declare const generateNavigation: (allFeatures: FeatureData[], currentDirPath?: string, currentFeatureSlug?: string, currentUseCase?: string) => string;
/**
 * Create a collection of all features across all directories
 */
export declare const collectAllFeatures: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featureMap: FeatureMap) => FeatureData[];
/**
 * Write an individual feature page
 */
export declare const writeFeatureHtml: (cypressConfig: Cypress.PluginConfigOptions, config: Config, feature: FeatureData, allFeatures: FeatureData[]) => void;
/**
 * Write a directory index page that lists the features in that directory
 */
export declare const writeDirectoryIndexHtml: (cypressConfig: Cypress.PluginConfigOptions, config: Config, dirPath: string, features: FeatureData[], allFeatures: FeatureData[]) => void;
/**
 * Writes the main index HTML file
 */
export declare const writeMainIndexHtml: (cypressConfig: Cypress.PluginConfigOptions, config: Config, allFeatures: FeatureData[]) => void;
/**
 * Copies CSS files to the output directory
 */
export declare const copyCssFiles: (cypressConfig: Cypress.PluginConfigOptions, config: Config) => void;
