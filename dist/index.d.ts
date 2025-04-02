import { Config } from './types';
export declare const generate: (on: Cypress.PluginEvents, cypressConfig: Cypress.PluginConfigOptions, config?: Config) => void;
type TestFn = (name: string, fn: () => void) => void;
type SuiteFn = (name: string, fn: () => void) => void;
type DescFn = (name: string) => void;
export declare const step: TestFn;
export declare const usecase: SuiteFn;
export declare const description: DescFn;
export {};
