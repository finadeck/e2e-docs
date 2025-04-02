/// <reference types="cypress" />

import { usecase, step, description } from '../../src'

usecase('Login Functionality', () => {
  description('Testing the user login functionality')
  
  step('Navigate to the login page', () => {
    cy.visit('https://example.com/login')
    cy.screenshot('login-page')
  })
  
  step('Enter username and password', () => {
    cy.get('#username').type('testuser')
    cy.get('#password').type('password123')
    cy.screenshot('credentials-entered')
  })
  
  step('Click the login button', () => {
    cy.get('#login-button').click()
    cy.screenshot('after-login-click')
  })
  
  step('Verify successful login', () => {
    cy.get('.welcome-message').should('contain', 'Welcome, Test User')
    cy.screenshot('successful-login')
  })
})

usecase('Password Reset', () => {
  description('Testing the password reset functionality')
  
  step('Navigate to the login page', () => {
    cy.visit('https://example.com/login')
  })
  
  step('Click on Forgot Password link', () => {
    cy.get('#forgot-password').click()
    cy.screenshot('forgot-password-page')
  })
  
  step('Enter email address', () => {
    cy.get('#email').type('test@example.com')
    cy.screenshot('email-entered')
  })
  
  step('Submit reset request', () => {
    cy.get('#reset-button').click()
    cy.screenshot('reset-submitted')
  })
  
  step('Verify confirmation message', () => {
    cy.get('.confirmation-message').should('contain', 'Password reset instructions sent')
    cy.screenshot('reset-confirmation')
  })
})