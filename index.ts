const path = require('path')
import { writeSidebar, writeScreenshots, writeRoot, writeFeatures, getFeatures } from './utils'
import { Config } from './types'

export const generate = (on: Cypress.PluginEvents, cypressConfig: Cypress.PluginConfigOptions, config?: Config) => {
  const { cypressDir = 'cypress', testDir = 'e2e', testRegex = /\.cy\.ts$/, outDir = 'turd' } = config || {}

  on('after:run', () =>
    g(cypressConfig, {
      cypressDir,
      testDir,
      testRegex,
      outDir
    })
  )
}

const g = (cypressConfig: Cypress.PluginConfigOptions, config: Config) => {
  const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir)
  const features = getFeatures(config, testDir)

  writeFeatures(cypressConfig, config, features)
  writeSidebar(cypressConfig, config, features)
  writeScreenshots(cypressConfig, config)
  writeRoot(cypressConfig, config)
}

type TestFn = (name: string, fn: () => void) => void
type SuiteFn = (name: string, fn: () => void) => void
type DescFn = (name: string) => void

export const step: TestFn = (name, fn) => {
  it(name, fn)
}

export const usecase: SuiteFn = (name, fn) => {
  describe(name, fn)
}

export const description: DescFn = name => {
  it(name)
}
