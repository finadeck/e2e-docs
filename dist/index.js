"use strict";
/// <reference types="cypress" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.description = exports.usecase = exports.step = exports.generate = void 0;
const path = __importStar(require("path"));
const utils_1 = require("./utils");
const generate = (on, cypressConfig, config) => {
    const { cypressDir = 'cypress', testDir = 'e2e', testRegex = /\.cy\.ts$/, outDir = 'docs/use-cases' } = config || {};
    on('after:run', () => g(cypressConfig, {
        cypressDir,
        testDir,
        testRegex,
        outDir
    }));
};
exports.generate = generate;
const g = (cypressConfig, config) => {
    const testDir = path.join(cypressConfig.projectRoot, config.cypressDir, config.testDir);
    const features = (0, utils_1.getFeatures)(config, testDir);
    (0, utils_1.writeFeatures)(cypressConfig, config, features);
    (0, utils_1.writeSidebar)(cypressConfig, config, features);
    (0, utils_1.writeScreenshots)(cypressConfig, config);
    (0, utils_1.writeRoot)(cypressConfig, config);
};
const step = (name, fn) => {
    it(name, fn);
};
exports.step = step;
const usecase = (name, fn) => {
    describe(name, fn);
};
exports.usecase = usecase;
const description = name => {
    it(name);
};
exports.description = description;
