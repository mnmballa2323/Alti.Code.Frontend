/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * Standard Interface for Alti.Code.Studio Plugins
 * @interface
 */
export class PluginInterface {
    constructor(config) {
        this.config = config;
        this.name = 'GenericPlugin';
        this.version = '0.0.1';
    }

    /**
     * Called when the plugin is loaded
     */
    async onInit() {
        throw new Error('Plugin must implement onInit()');
    }

    /**
     * Called when a specific event triggers the plugin
     * @param {string} eventName 
     * @param {object} payload 
     */
    async onEvent(eventName, payload) {
        // Optional
    }

    /**
     * Define the tools this plugin exposes to Agents
     * @returns {Array<object>} Tool definitions
     */
    getTools() {
        return [];
    }
}
