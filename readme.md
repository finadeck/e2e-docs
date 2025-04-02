# Turd

## Configuration 
````
export default defineConfig({
  projectId: 'Cypress test project',
  e2e: {
    defaultCommandTimeout: 25000,
    experimentalRunAllSpecs: true,
    baseUrl: 'http://localhost:3000',
    experimentalStudio: true,
    testIsolation: false,
    specPattern: ['*/**/main.spec.ts'],
    setupNodeEvents(on, config) {
      turd(on, config)
      config.env = {
        ...process.env,
        ...config.env
      }
      return config
    }
  }
})

````

## Implementation
````
/// <reference types="cypress" />

import { usecase, step } from '../../../../../plugins/turd'

usecase('Tarkastele skenaarioita', () => {
  step('Navigoi sivulle Asetukset / Yrityksen asetukset / Budjetointi / Skenaariot', () => {
    cy.goTo(`/settings/company/budgeting/budgeting-scenarios`)
    cy.wait(4000)
    cy.screenshot('budget-creation-start')
  })
  
  step('Ensimmäisenä listalta löytyy oletusskenaario', () => {
    cy.get('.ant-table-row-level-0 td').eq(0).should('have.text', 'Oletus')
    cy.get('.ant-table-row-level-0 td').eq(1).should('have.text', 'Oletus')
  })

  it('random', () => {
    cy.get('.ant-table-row-level-0 td').eq(0).should('not.have.text', 'mitä')
  })

  step('Oletusskenaariota ei voi lukita tai poistaa', () => {
    cy.get('[data-cy="locked-button"]').first().should('be.disabled')
    cy.get('[data-cy="delete-button"]').first().should('be.disabled')
  })
})

````
