/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';

class CortexNode {
    /**
     * @param {string} id Unique file path or conceptual entity
     * @param {string} type 'file', 'function', 'class'
     */
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.dependencies = new Set(); // Edges pointing OUT (What this node relies on)
        this.dependents = new Set();   // Edges pointing IN (What relies on this node)
    }
}

export class CortexService {
    constructor() {
        this.name = 'TheCortex';
        this.graph = new Map(); // id -> CortexNode
        logger.info('🧠 CortexService: Neural Context Synthesis engine initialized.');
    }

    /**
     * Registers a deterministic relationship between two files via AST import analysis.
     * @param {string} dependentPath The file doing the importing
     * @param {string} dependencyPath The file being imported
     */
    addDeterministicEdge(dependentPath, dependencyPath) {
        if (!this.graph.has(dependentPath)) this.graph.set(dependentPath, new CortexNode(dependentPath, 'file'));
        if (!this.graph.has(dependencyPath)) this.graph.set(dependencyPath, new CortexNode(dependencyPath, 'file'));

        const dependent = this.graph.get(dependentPath);
        const dependency = this.graph.get(dependencyPath);

        dependent.dependencies.add(dependencyPath);
        dependency.dependents.add(dependentPath);
    }

    /**
     * Calculates the "Impact Radius" of modifying a specific file.
     * Recursively traverses the inbound dependent edges to find all downstream files 
     * that would structurally break if the target file's signature changes.
     * 
     * @param {string} targetFilePath The file being modified
     * @returns {string[]} Array of absolute file paths representing the blast radius
     */
    calculateImpactRadius(targetFilePath) {
        if (!this.graph.has(targetFilePath)) {
            logger.warn(`🧠 CortexService: Target [${targetFilePath}] not found in Neural Graph.`);
            return [];
        }

        const blastRadius = new Set();
        const queue = [targetFilePath];

        while (queue.length > 0) {
            const currentId = queue.shift();
            const currentNode = this.graph.get(currentId);

            if (currentNode) {
                for (const dependentId of currentNode.dependents) {
                    if (!blastRadius.has(dependentId)) {
                        blastRadius.add(dependentId);
                        queue.push(dependentId); // Traverse upstream
                    }
                }
            }
        }

        const impactArray = Array.from(blastRadius);
        logger.info(`🧠 CortexService: Calculated impact radius for [${targetFilePath}]. Affects ${impactArray.length} downstream nodes.`);
        return impactArray;
    }
}

export const cortexService = new CortexService();
