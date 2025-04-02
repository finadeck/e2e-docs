import { FeatureMap, Config } from './types';
export declare const writeRoot: (cypressConfig: Cypress.PluginConfigOptions, config: Config) => void;
export declare const writeFeatures: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featureMap: FeatureMap) => void;
export declare const writeFeature: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featurePath: string, md: string) => void;
export declare const writeSidebar: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featureMap: FeatureMap) => void;
export declare const writeScreenshots: (cypressConfig: Cypress.PluginConfigOptions, config: Config) => void;
export declare const getFeatures: (config: Config, dir: string, currentPath?: string, features?: FeatureMap) => FeatureMap;
/**
 * Converts Cypress test file content to markdown format
 * @param content The content of the Cypress test file
 * @returns Markdown formatted content
 */
export declare const ucToMarkdown: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featurePath: string, content: string) => string | null;
export declare const copyDirectorySync: (source: string, destination: string) => void;
export declare const generateSidebar: (features: FeatureMap) => string;
