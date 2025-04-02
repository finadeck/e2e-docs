/// <reference types="cypress" />

import { existsSync, statSync, mkdirSync, readdirSync, copyFileSync, writeFileSync } from 'fs'
import * as path from 'path'
import { FeatureMap, Config } from '../types'

/**
 * Creates necessary directories if they don't exist
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Copies template files to the output directory
 */
export const writeRoot = (cypressConfig: Cypress.PluginConfigOptions, config: Config): void => {
  const packageRootDir = path.join(__dirname, '..', '..', 'templates')
  const outputDir = path.join(cypressConfig.projectRoot, config.outDir)

  ensureDirectoryExists(outputDir)

  const files = ['index.html', '.nojekyll', 'readme.md']
  for (const file of files) {
    copyFileSync(path.join(packageRootDir, file), path.join(outputDir, file))
  }
}

/**
 * Writes a feature's markdown file to the output directory
 */
export const writeFeature = (
  cypressConfig: Cypress.PluginConfigOptions, 
  config: Config,
  featurePath: string,
  md: string
): void => {
  // Define the output file path
  const outputDir = path.join(cypressConfig.projectRoot, config.outDir, featurePath)
  const outputFile = path.join(outputDir, `readme.md`)

  // Ensure the directory exists
  ensureDirectoryExists(outputDir)

  // Write the markdown file
  writeFileSync(outputFile, md)
}

/**
 * Scans the test directory and returns a map of features to test files
 */
export const getFeatures = (
  config: Config, 
  dir: string, 
  currentPath = '', 
  features: FeatureMap = {}
): FeatureMap => {
  const files = readdirSync(dir)

  for (const file of files) {
    const p = [currentPath, file].join('/')
    const useCasePath = path.join(dir, file)
    
    if (statSync(useCasePath).isDirectory()) {
      getFeatures(config, useCasePath, p, features) // Recursively read subdirectories
    } else if (config.testRegex.test(useCasePath)) {
      ;(features[currentPath] = features[currentPath] || []).push(file)
    }
  }

  return features
}

/**
 * Copies a directory and its contents recursively
 */
export const copyDirectorySync = (source: string, destination: string): void => {
  // Check if source exists and is a directory
  if (!existsSync(source)) {
    return
  }
  if (!statSync(source).isDirectory()) {
    throw new Error(`Source '${source}'—is not a directory`)
  }

  // Create destination directory if it doesn't exist
  ensureDirectoryExists(destination)

  // Read all items in the source directory
  const items = readdirSync(source)

  // Process each item
  items.forEach(item => {
    const sourcePath = path.join(source, item)
    const destPath = path.join(destination, item)

    // Get stats to determine if it's a file or directory
    const stats = statSync(sourcePath)

    if (stats.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectorySync(sourcePath, destPath)
    } else if (stats.isFile()) {
      // Copy file
      copyFileSync(sourcePath, destPath)
    }
  })
}
