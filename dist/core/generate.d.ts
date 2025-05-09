import { Config, FeatureMap } from '../types';
/**
 * Writes feature HTML files to the output directory
 */
export declare const writeFeatures: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featureMap: FeatureMap) => void;
/**
 * Main function to generate documentation
 */
export declare const generateDocs: (cypressConfig: Cypress.PluginConfigOptions, config: Config) => void;
/**
 * Standalone function to generate documentation without running tests
 */
export declare const generateStandalone: (projectRoot: string, config?: Partial<Config>) => void;
/**
 * Plugin registration function
 */
export declare const generate: (on: Cypress.PluginEvents, cypressConfig: Cypress.PluginConfigOptions, config?: Config & {
    generateOnlyWithCommand?: boolean;
}) => void;
