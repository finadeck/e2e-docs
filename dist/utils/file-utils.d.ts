import { FeatureMap, Config } from '../types';
/**
 * Creates necessary directories if they don't exist
 */
export declare const ensureDirectoryExists: (dirPath: string) => void;
/**
 * Copies template files to the output directory
 */
export declare const writeRoot: (cypressConfig: Cypress.PluginConfigOptions, config: Config) => void;
/**
 * Writes a feature's markdown file to the output directory
 */
export declare const writeFeature: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featurePath: string, md: string) => void;
/**
 * Scans the test directory and returns a map of features to test files
 */
export declare const getFeatures: (config: Config, dir: string, currentPath?: string, features?: FeatureMap) => FeatureMap;
/**
 * Copies a directory and its contents recursively
 */
export declare const copyDirectorySync: (source: string, destination: string) => void;
