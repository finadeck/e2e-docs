import { FeatureMap, Config } from '../types';
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
export declare const ucToMarkdown: (cypressConfig: Cypress.PluginConfigOptions, config: Config, featurePath: string, content: string) => string | null;
/**
 * Generates a sidebar from the feature map.
 *
 * @param features The feature map
 * @returns Markdown for the sidebar
 */
export declare const generateSidebar: (features: FeatureMap) => string;
