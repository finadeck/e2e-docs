import { existsSync, statSync, mkdirSync, readdirSync, copyFileSync, writeFileSync, readFileSync } from 'fs'
import { FeatureMap, TreeNode, Config } from './types'
const path = require('path')

export const writeRoot = (cypressConfig: Cypress.PluginConfigOptions, config: Config) => {
  const packageRootDir = path.join(__dirname, '..', 'templates')
  const outputDir = path.join(cypressConfig.projectRoot, config.outDir)

  const files = ['index.html', '.nojekyll', 'readme.md']
  for (const file of files) {
    copyFileSync(path.join(packageRootDir, file), path.join(outputDir, file))
  }
}

export const writeFeatures = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config,
  featureMap: FeatureMap
) => {
  const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir)

  for (const featurePath of Object.keys(featureMap)) {
    const useCases = featureMap[featurePath]
    const title = `# ${featurePath.split('/').pop()}`
    const md = useCases.map(useCase => {
      const testContent = readFileSync(path.join(testDir, featurePath, useCase), 'utf8')
      return ucToMarkdown(cypressConfig, config, featurePath, testContent)
    })

    writeFeature(cypressConfig, config, featurePath, [title, ...md].join('\n\n'))
  }
}

export const writeFeature = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config,
  featurePath: string,
  md: string
) => {
  // Define the output file path
  const outputFile = path.join(cypressConfig.projectRoot, config.outDir, featurePath, `readme.md`)

  // Extract the directory path (excluding the file name)
  const outputDir = path.dirname(outputFile)

  // Ensure the full directory structure exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  writeFileSync(outputFile, md)
}

export const writeSidebar = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config,
  featureMap: FeatureMap
) => {
  const outputFile = path.join(cypressConfig.projectRoot, config.outDir, `_sidebar.md`)
  const outputDir = path.dirname(outputFile)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  writeFileSync(outputFile, generateSidebar(featureMap))
}

export const writeScreenshots = (cypressConfig: Cypress.PluginConfigOptions, config: Config) => {
  const outputDir = path.join(cypressConfig.projectRoot, config.outDir, 'screenshots')
  cypressConfig.screenshotsFolder && copyDirectorySync(cypressConfig.screenshotsFolder, outputDir)
}

export const getFeatures = (config: Config, dir: string, currentPath = '', features: FeatureMap = {}) => {
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
 * Converts Cypress test file content to markdown format
 * @param content The content of the Cypress test file
 * @returns Markdown formatted content
 */
export const ucToMarkdown = (
  cypressConfig: Cypress.PluginConfigOptions,
  config: Config,
  featurePath: string,
  content: string
): string | null => {
  const useCasePattern = 'usecase'
  const stepPattern = 'step'
  const screenshotPattern = 'screenshot'
  const descriptionPattern = 'description'
  const stepsTitle = 'Vaiheet'

  const useCaseRegex = new RegExp(`${useCasePattern}\\(['"]([^'"]+)['"]`)
  const useCaseMatch = content.match(useCaseRegex)
  const useCaseTitle = useCaseMatch?.[1]
  const screenshotDir = path.join(cypressConfig.projectRoot, config.outDir, 'screenshots')

  if (!useCaseTitle) return null

  // Build markdown
  let markdown = `## ${useCaseTitle}\n\n`

  // Extract description
  const descriptionRegex = new RegExp(`${descriptionPattern}\\s*\\(\\s*['"]([^'"]+)['"]`)
  const descriptionMatch = content.match(descriptionRegex)
  if (descriptionMatch?.[1]) {
    markdown += `### ${descriptionMatch[1]}\n\n`
  }

  markdown += `### ${stepsTitle}\n\n`

  const stepRegex = /step\s*\(\s*(['"])((?:\\\1|.)*?)\1\s*,/gs
  let match

  while ((match = stepRegex.exec(content)) !== null) {
    const stepName = match[2].trim()
    markdown += `* ${stepName}\n`

    // Check if this step block contains a screenshot
    const screenshotMatch = content.slice(match.index).match(new RegExp(`${screenshotPattern}\\(['"]([^'"]+)['"]`))
    if (screenshotMatch) {
      const screenshotName = screenshotMatch[1]

      // Ensure correct path structure
      const fullScreenshotPath = path.join(screenshotDir, featurePath, 'main.spec.ts', `${screenshotName}.png`)

      markdown += `\n![${screenshotName}](${fullScreenshotPath})\n\n`
    }
  }

  return markdown
}

export const copyDirectorySync = (source: string, destination: string) => {
  // Check if source exists and is a directory
  if (!existsSync(source)) {
    throw new Error(`Source directory '${source}' does not exist`)
  }
  if (!statSync(source).isDirectory()) {
    throw new Error(`Source '${source}'—is not a directory`)
  }

  // Create destination directory if it doesn't exist
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true })
  }

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

export const generateSidebar = (features: FeatureMap): string => {
  // Initialize tree with explicit type and required children property
  const tree: TreeNode = {
    children: {}
  }

  // Process paths from features object
  Object.keys(features).forEach(path => {
    const segments = path.slice(1).split('/') // Remove leading slash
    let current = tree.children

    segments.forEach((segment, index) => {
      if (!current[segment]) {
        current[segment] = { children: {} } // Always initialize with children
      }
      if (index === segments.length - 1) {
        current[segment].path = path // Store full path at leaf
      }
      current = current[segment].children
    })
  })

  // Generate Markdown with explicit type
  function buildMarkdown(obj: { [key: string]: TreeNode }, indent: number = 0): string {
    let result = ''
    const indentStr = '  '.repeat(indent)

    Object.keys(obj)
      .sort()
      .forEach(key => {
        const node = obj[key]
        if (node.path) {
          // Leaf node with link
          result += `${indentStr}* [${key}](${node.path}/readme.md)\n`
        } else {
          // Parent node
          result += `${indentStr}* ${key}\n`
          result += buildMarkdown(node.children, indent + 1)
        }
      })

    return result
  }

  return buildMarkdown(tree.children)
}
