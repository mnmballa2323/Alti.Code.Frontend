/**
 * Copyright (c) 2026 Inso Code
 *
 * gensx_workflow.service.js — GenSX Workflow Service Wrapper.
 * Exposes declarative, component-based execution flows.
 */

import { Component, Workflow } from '@gensx/core';
import { logger } from '../../../shared/logger.js';

export class GenSxWorkflowService {
    /**
     * Helper to declare a new GenSX Component.
     * @param {string} name 
     * @param {function} executionFn 
     * @returns {object} GenSX Component
     */
    static createComponent(name, executionFn) {
        logger.info(`🏗️ [GenSX Workflow] Declaring component: ${name}`);
        return Component(name, executionFn);
    }

    /**
     * Executes a GenSX workflow component with inputs.
     * @param {object} component 
     * @param {object} inputs 
     * @returns {Promise<any>} Output results
     */
    static async execute(component, inputs = {}) {
        logger.info(`🏃 [GenSX Workflow] Initiating execution of workflow`);
        try {
            // Note: In @gensx/core, components are executed directly or wrapped.
            // We run it as a promise-based invocation.
            const result = await component(inputs);
            return result;
        } catch (error) {
            logger.error(`❌ [GenSX Workflow] Execution failed: ${error.message}`);
            throw error;
        }
    }
}

export default GenSxWorkflowService;
