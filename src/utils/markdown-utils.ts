/// <reference types="cypress" />

import { readFileSync } from 'fs'
import * as path from 'path'
import { FeatureMap, TreeNode, Config } from '../types'

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
  const stepsTitle = 'Steps'

  const useCaseRegex = new RegExp(`${useCasePattern}\\(['"]([^'"]+)['"]`)
  const useCaseMatch = content.match(useCaseRegex)
  const useCaseTitle = useCaseMatch?.[1]

  if (!useCaseTitle) return null

  // Build markdown
  let markdown = `## ${useCaseTitle}\n\n`

  // Extract description
  const descriptionRegex = new RegExp(`${descriptionPattern}\\s*\\(\\s*['"]([^'"]+)['"]`)
  const descriptionMatch = content.match(descriptionRegex)
  if (descriptionMatch?.[1]) {
    markdown += `${descriptionMatch[1]}\n\n`
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
      
      // Reference the screenshot in the same directory
      // The path doesn't need to include any directory structure since 
      // the screenshot will be in the same directory as the markdown file
      markdown += `\n![${screenshotName}](${screenshotName}.png)\n\n`
    }
  }

  return markdown
}

/**
 * Generates a sidebar from the feature map.
 * 
 * @param features The feature map
 * @returns Markdown for the sidebar
 */
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