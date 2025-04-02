# E2E Documentation Generator

A Cypress plugin that generates beautiful documentation from your end-to-end tests.

## Features

- 📝 **Auto-Documentation**: Automatically generates Markdown documentation from your Cypress tests
- 📸 **Screenshot Integration**: Embeds screenshots directly alongside the test steps they relate to
- 🧩 **Structured Organization**: Organizes tests into use cases and steps for clear documentation
- 🌲 **Navigation Sidebar**: Generates a navigable sidebar for easy browsing
- 🧪 **Test Compatibility**: Works alongside regular Cypress tests

## Installation

```bash
# Using npm
npm install github:finadeck/e2e-docs --save-dev

# Using yarn
yarn add -D github:finadeck/e2e-docs

# Using pnpm
pnpm add -D github:finadeck/e2e-docs
```

## Configuration

Add the plugin to your Cypress configuration file:

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress'
import { generate } from 'e2e-docs'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Register the e2e-docs plugin
      generate(on, config, {
        // Custom options (all optional)
        cypressDir: 'cypress',        // Default: 'cypress'
        testDir: 'e2e',               // Default: 'e2e'
        testRegex: /\.cy\.ts$/,       // Default: /\.cy\.ts$/
        outDir: 'docs/use-cases'      // Default: 'docs/use-cases'
      })
      
      return config
    }
  }
})
```

## Usage

In your Cypress test files, use the provided functions to document your tests:

```typescript
/// <reference types="cypress" />

import { usecase, step, description } from 'e2e-docs'

usecase('Login Functionality', () => {
  description('Testing the user login functionality')
  
  step('Navigate to the login page', () => {
    cy.visit('/login')
    cy.screenshot('login-page') // Screenshot will be included in docs
  })
  
  step('Enter username and password', () => {
    cy.get('#username').type('testuser')
    cy.get('#password').type('password123')
  })
  
  step('Click the login button', () => {
    cy.get('#login-button').click()
    cy.screenshot('after-login') // Screenshot will be included in docs
  })
  
  step('Verify successful login', () => {
    cy.get('.welcome-message').should('contain', 'Welcome!')
  })

  // Regular Cypress tests can be mixed with documented steps
  it('can also include regular Cypress tests', () => {
    cy.get('.logout-button').should('be.visible')
  })
})
```

## Generated Documentation

After running your Cypress tests, documentation will be generated in the specified output directory (`docs/use-cases` by default). The documentation includes:

- Markdown files for each feature with descriptions and steps
- Screenshots embedded directly alongside the relevant steps
- A sidebar for navigation between features
- Index page for easy browsing

You can serve the documentation using any static site server or tools like [docsify](https://docsify.js.org/).

## File Structure

The generated documentation follows this structure:

```
docs/use-cases/
├── _sidebar.md     # Navigation sidebar
├── index.html      # Main HTML page
├── feature1/       # Feature directory
│   ├── readme.md   # Feature documentation
│   └── *.png       # Screenshots for the feature
├── feature2/
│   ├── readme.md
│   └── *.png
└── ...
```

## Advanced Usage

### Custom Templates

You can customize the output templates by creating your own templates directory and modifying the plugin configuration.

### Integration with CI/CD

You can integrate the documentation generation into your CI/CD pipeline by running Cypress tests and then serving the generated documentation as static files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT