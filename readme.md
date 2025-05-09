# E2E Documentation Generator

A Cypress plugin that generates beautiful HTML documentation from your end-to-end tests.

## Features

- 📝 **Auto-Documentation**: Automatically generates HTML documentation from your Cypress tests
- 📸 **Screenshot Integration**: Embeds screenshots directly alongside the test steps they relate to
- 🧩 **Structured Organization**: Organizes tests into use cases and steps for clear documentation
- 🌲 **Navigation Sidebar**: Generates a navigable sidebar for easy browsing
- 🎨 **Customizable Styling**: Simple CSS structure for easy theme customization
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
        outDir: 'docs/use-cases',     // Default: 'docs/use-cases'
        generateOnlyWithCommand: false // Default: false - set to true to disable auto-generation after test runs
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

feature('User authentication', () => {
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
})
```

## Generated Documentation

Documentation can be generated in two ways:

### 1. After running Cypress tests

By default, HTML documentation will be generated automatically after running your Cypress tests. The documentation will be created in the specified output directory (`docs/use-cases` by default).

### 2. Without running tests (standalone generation)

You can also generate documentation without running tests using one of these methods:

#### Using the CLI command:

```bash
# Using npm
npx e2e-docs --outDir=my-docs

# Using globally installed package
e2e-docs --cypressDir=cypress --testDir=e2e --outDir=docs/e2e-docs
```

Available options:
- `--projectRoot=path/to/project` - Path to the project root (default: current directory)
- `--cypressDir=dirname` - Cypress directory name (default: cypress)
- `--testDir=dirname` - Test directory name (default: e2e)
- `--outDir=dirname` - Output directory name (default: docs/use-cases)
- `--testRegex=regex` - Regular expression for test files (default: \\.cy\\.ts$)

#### Using the API in your scripts:

```typescript
import { generateStandalone } from 'e2e-docs';

// Generate documentation with default options
generateStandalone(process.cwd());

// Or with custom options
generateStandalone(process.cwd(), {
  cypressDir: 'cypress',
  testDir: 'e2e',
  outDir: 'my-custom-docs',
  testRegex: /\.cy\.ts$/
});
```

#### Using Cypress task:

If you have the plugin configured in your Cypress setup:

```typescript
// In your test file or support file
cy.task('generateDocs');
```

The generated documentation includes:
- HTML files for each feature with descriptions and steps
- Screenshots embedded directly alongside the relevant steps
- A navigation sidebar for easy browsing between features
- Index page for quick access

You can view the documentation by opening the index.html file in any browser.

## File Structure

The generated documentation follows this structure:

```
docs/use-cases/
├── index.html          # Main index page
├── styles/             # CSS styles
│   ├── main.css        # Main stylesheet
│   └── theme.css       # Theme variables
├── feature1/           # Feature directory
│   ├── index.html      # Feature documentation
│   └── *.png           # Screenshots for the feature
├── feature2/
│   ├── index.html
│   └── *.png
└── ...
```

## Customizing the Theme

The documentation uses a modular CSS structure with variables, making it easy to customize:

1. You can modify the colors, fonts, and other styles by editing the `theme.css` file in the output directory.
2. The main styling is in `main.css`, which you can also customize if needed.

Example of customizing the theme:

```css
/* custom-theme.css */
:root {
  /* Override primary color */
  --primary-color: #3498db;
  --primary-color-dark: #2980b9;
  --accent-color: #3498db;
  
  /* Change sidebar colors */
  --sidebar-bg-color: #2c3e50;
  --sidebar-text-color: #ffffff;
  --sidebar-link-color: #ecf0f1;
  --sidebar-active-color: #3498db;
  
  /* Modify fonts */
  --font-family: 'Roboto', sans-serif;
}
```

Simply copy the default `theme.css` file and modify the variables to customize the look of your documentation.

## Advanced Usage

### Custom Templates

You can customize the HTML templates by:

1. Copy the `templates` directory from the package
2. Modify the HTML templates as needed
3. Use a custom path for the templates in your configuration

```typescript
generate(on, config, {
  templatesDir: 'path/to/your/templates'
})
```

### NPM Scripts

For convenience, you can add npm scripts to your package.json:

```json
"scripts": {
  "docs": "e2e-docs",
  "docs:custom": "e2e-docs --outDir=custom-docs-folder"
}
```

Then run:

```bash
npm run docs
```

### Integration with CI/CD

You can integrate the documentation generation into your CI/CD pipeline by running Cypress tests and serving the generated HTML files as static files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT