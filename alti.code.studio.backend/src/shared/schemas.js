/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { z } from 'zod';

// Schema for an Agent Configuration
export const agentConfigSchema = z.object({
    name: z.string().min(1, "Name is required"),
    role: z.enum(['engineer', 'architect', 'qa', 'product_manager']),
    capabilities: z.array(z.string()).optional().default([]),
    settings: z.object({
        verbose: z.boolean().default(false),
        maxRetries: z.number().int().min(0).default(3)
    }).optional().default({})
});

// Schema for a generic Task
export const taskSchema = z.object({
    id: z.string().uuid().optional(), // Optional on creation, required on retrieval usually
    type: z.enum(['refactor', 'test', 'analyze', 'generate']),
    payload: z.record(z.any()), // Flexible payload
    priority: z.number().min(1).max(10).default(5),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending')
});

// Schema for Tree-sitter Parse Request (example)
export const parseRequestSchema = z.object({
    code: z.string().min(1),
    language: z.enum(['javascript', 'typescript', 'python', 'go', 'rust']).default('javascript')
});

// Schema for Refactor Agent Requests
export const refactorRequestSchema = z.object({
    filePaths: z.array(z.string().min(1)).min(1, "At least one file path is required"),
    instruction: z.string().min(5, "Instruction must be descriptive"),
    context: z.record(z.any()).optional().default({})
});
