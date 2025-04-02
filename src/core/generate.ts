/// <reference types="cypress" />

import * as path from 'path'
import { readFileSync } from 'fs'
import { Config, FeatureMap } from '../types'
import { getFeatures, writeFeature, writeRoot, ensureDirectoryExists } from '../utils/file-utils'
import { ucToMarkdown, generateSidebar } from '../utils/markdown-utils'
import { copyScreenshotsToFeatures } from '../utils/screenshot-utils'

/**
 * Writes feature markdown files to the output directory
 */
export const writeFeatures = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config,
  featureMap: FeatureMap
): void => {
  const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir)

  for (const featurePath of Object.keys(featureMap)) {
    const useCases = featureMap[featurePath]
    // Use the directory name as the feature title
    const title = `# ${featurePath.split('/').pop()}`
    
    // Convert each use case to markdown
    const md = useCases.map(useCase => {
      const testFilePath = path.join(testDir, featurePath, useCase)
      const testContent = readFileSync(testFilePath, 'utf8')
      return ucToMarkdown(cypressConfig, config, featurePath, testContent)
    }).filter(Boolean) // Filter out null values
    
    // Write the feature markdown
    writeFeature(cypressConfig, config, featurePath, [title, ...md].join('\n\n'))
  }
}

/**
 * Writes the sidebar file
 */
export const writeSidebar = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config,
  featureMap: FeatureMap
): void => {
  const outputFile = path.join(cypressConfig.projectRoot, config.outDir, `_sidebar.md`)
  const outputDir = path.dirname(outputFile)
  
  ensureDirectoryExists(outputDir)
  
  // Generate and write the sidebar content
  const sidebarContent = generateSidebar(featureMap)
  require('fs').writeFileSync(outputFile, sidebarContent)
}

/**
 * Main function to generate documentation
 */
export const generateDocs = (cypressConfig: Cypress.PluginConfigOptions, config: Config): void => {
  // Get the test directory
  const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir)
  
  // Find all features
  const features = getFeatures(config, testDir)
  
  // Generate documentation
  console.log(`Generating documentation for ${Object.keys(features).length} features...`)
  
  // Process screenshots first to ensure they're available when generating markdown
  console.log('Processing screenshots...')
  copyScreenshotsToFeatures(cypressConfig, config)
  
  // Generate feature documentation
  console.log('Generating feature documentation...')
  writeFeatures(cypressConfig, config, features)
  
  // Generate sidebar
  console.log('Generating navigation sidebar...')
  writeSidebar(cypressConfig, config, features)
  
  // Copy template files
  console.log('Copying template files...')
  writeRoot(cypressConfig, config)
  
  console.log(`Documentation successfully generated in ${path.join(cypressConfig.projectRoot, config.outDir)}`)
}

/**
 * Plugin registration function
 */
export const generate = (
  on: Cypress.PluginEvents, 
  cypressConfig: Cypress.PluginConfigOptions, 
  config?: Config
): void => {
  const defaultConfig: Config = {
    cypressDir: 'cypress', 
    testDir: 'e2e', 
    testRegex: /\.cy\.ts$/, 
    outDir: 'docs/use-cases'
  }
  
  const finalConfig: Config = { ...defaultConfig, ...config }
  
  // Register after:run event
  on('after:run', () => generateDocs(cypressConfig, finalConfig))
}