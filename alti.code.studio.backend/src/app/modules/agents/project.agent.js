/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';

class ProjectAgent {
    constructor() {
        this.stateFile = 'project_state.json';
        this.tasks = [];
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        try {
            const data = await fs.readFile(this.stateFile, 'utf-8');
            this.tasks = JSON.parse(data);
        } catch (error) {
            logger.info('ProjectAgent: No state file found. Starting fresh.');
            this.tasks = [];
        }
        this.isInitialized = true;
    }

    async save() {
        await fs.writeFile(this.stateFile, JSON.stringify(this.tasks, null, 2));
    }

    async getTasks() {
        await this.init();
        return this.tasks;
    }

    async addTask(description) {
        await this.init();
        const newTask = {
            id: Date.now().toString(),
            description,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        this.tasks.push(newTask);
        await this.save();
        return newTask;
    }

    async completeTask(taskId) {
        await this.init();
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            await this.save();
            return true;
        }
        return false;
    }
}

export const projectAgent = new ProjectAgent();
