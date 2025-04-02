import { Config, FeatureMap } from '../types';
/**
 * Writes feature markdown files to the output directory
 */
export declare const writeFeatures: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featureMap: FeatureMap) => void;
/**
 * Writes the sidebar file
 */
export declare const writeSidebar: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featureMap: FeatureMap) => void;
/**
 * Main function to generate documentation
 */
export declare const generateDocs: (cypressConfig: Cypress.PluginConfigOptions, config: Config) => void;
/**
 * Plugin registration function
 */
export declare const generate: (on: Cypress.PluginEvents, cypressConfig: Cypress.PluginConfigOptions, config?: Config) => void;
