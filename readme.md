# E2E Documentation Generator

A Cypress plugin that generates beautiful documentation from your end-to-end tests.

## Installation

```bash
# Using npm
npm install e2e-docs --save-dev

# Using yarn
yarn add -D e2e-docs
```

## Configuration

Add the plugin to your Cypress configuration file:

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress'
import { generate } from 'e2e-docs'

export default defineConfig({
  projectId: 'Cypress test project',
  e2e: {
    // Your other Cypress configuration
    setupNodeEvents(on, config) {
      generate(on, config)
      
      // Your other Cypress plugins
      config.env = {
        ...process.env,
        ...config.env
      }
      return config
    }
  }
})
```

## Usage

In your Cypress test files, you can use the `usecase` and `step` functions to document your tests:

```typescript
/// <reference types="cypress" />

import { usecase, step } from 'e2e-docs'

usecase('View scenarios', () => {
  step('Navigate to Settings / Company Settings / Budgeting / Scenarios', () => {
    cy.goTo(`/settings/company/budgeting/budgeting-scenarios`)
    cy.wait(4000)
    cy.screenshot('budget-creation-start')
  })
  
  step('The default scenario is first in the list', () => {
    cy.get('.ant-table-row-level-0 td').eq(0).should('have.text', 'Default')
    cy.get('.ant-table-row-level-0 td').eq(1).should('have.text', 'Default')
  })

  // Regular Cypress tests can be mixed with documented steps
  it('random assertion', () => {
    cy.get('.ant-table-row-level-0 td').eq(0).should('not.have.text', 'something')
  })

  step('The default scenario cannot be locked or deleted', () => {
    cy.get('[data-cy="locked-button"]').first().should('be.disabled')
    cy.get('[data-cy="delete-button"]').first().should('be.disabled')
  })
})
```

## Features

- Generates HTML documentation from your Cypress tests
- Captures screenshots and includes them in the documentation
- Organizes tests into use cases and steps
- Works alongside regular Cypress tests
- Customizable output directory

## Advanced Configuration

You can customize the plugin behavior by passing a configuration object:

```typescript
import { generate } from 'e2e-docs'

generate(on, config, {
  outDir: 'docs/e2e',       // Output directory (default: 'cypress/docs')
  screenshotsDir: 'custom', // Screenshots directory (default: 'screenshots')
  // Other configuration options
})
```

## License

MIT