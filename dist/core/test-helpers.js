"use strict";
/// <reference types="cypress" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.description = exports.usecase = exports.step = void 0;
/**
 * Defines a test step in an E2E test use case.
 * Each step will be documented in the generated documentation.
 *
 * @param name The name of the step
 * @param fn The function containing the step implementation
 */
const step = (name, fn) => {
    it(name, fn);
};
exports.step = step;
/**
 * Defines a use case in an E2E test suite.
 * Each use case will be documented as a separate section in the generated documentation.
 *
 * @param name The name of the use case
 * @param fn The function containing the use case steps
 */
const usecase = (name, fn) => {
    describe(name, fn);
};
exports.usecase = usecase;
/**
 * Adds a description to a use case.
 * The description will be included in the generated documentation.
 *
 * @param name The description text
 */
const description = name => {
    it(name);
};
exports.description = description;
