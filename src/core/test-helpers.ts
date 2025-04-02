/// <reference types="cypress" />

type TestFn = (name: string, fn: () => void) => void
type SuiteFn = (name: string, fn: () => void) => void
type DescFn = (name: string) => void

/**
 * Defines a test step in an E2E test use case.
 * Each step will be documented in the generated documentation.
 * 
 * @param name The name of the step
 * @param fn The function containing the step implementation
 */
export const step: TestFn = (name, fn) => {
  it(name, fn)
}

/**
 * Defines a use case in an E2E test suite.
 * Each use case will be documented as a separate section in the generated documentation.
 * 
 * @param name The name of the use case
 * @param fn The function containing the use case steps
 */
export const usecase: SuiteFn = (name, fn) => {
  describe(name, fn)
}

/**
 * Adds a description to a use case.
 * The description will be included in the generated documentation.
 * 
 * @param name The description text
 */
export const description: DescFn = name => {
  it(name)
}
