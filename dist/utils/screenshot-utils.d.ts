import { Config } from '../types';
/**
 * Finds and copies screenshots from Cypress screenshots folder to the feature documentation directory
 * Modified to place screenshots in the same directory as the markdown files
 *
 * @param cypressConfig The Cypress configuration
 * @param config The plugin configuration
 */
export declare const copyScreenshotsToFeatures: (cypressConfig: Cypress.PluginConfigOptions, config: Config) => void;
/**
 * Verifies that screenshots are correctly placed in the same directories as their corresponding markdown files
 */
export declare const verifyScreenshots: (docsDir: string) => void;
