/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Oracle" - Database Performance & DBA Agent
 * Responsible for query analysis, N+1 detection, and schema optimization suggestions.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class OracleAgent {
    constructor() {
        this.projectRoot = process.cwd();
    }

    /**
     * Analyze a SQL Query for performance
     * @param {string} sql 
     */
    async analyzeQuery(sql) {
        logger.info(`🔮 Oracle: Analyzing query performance...`);

        const prompt = `
        You are "The Oracle", a Database Performance Expert (PostgreSQL focus).
        TASK: Analyze this SQL query. Explain the execution plan (hypothetically) and suggest indexes.
        
        QUERY:
        ${sql}

        OUTPUT JSON:
        {
            "complexity": "O(n) / O(log n) etc",
            "potential_bottlenecks": ["..."],
            "suggested_indexes": ["CREATE INDEX ..."],
            "rating": number (0-10, 10 is perfect)
        }
        `;

        const response = await aiProvider.reason(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { rating: 0, suggestions: [] };

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Static Analysis to detect N+1 problems in code
     * @param {string} filePath 
     */
    async detectNPlusOne(filePath) {
        logger.info(`🔮 Oracle: Scanning ${filePath} for N+1 queries...`);

        let content;
        try {
            content = await fs.readFile(path.resolve(this.projectRoot, filePath), 'utf-8');
        } catch (error) {
            throw new Error(`File not found: ${filePath}`);
        }

        const prompt = `
        You are "The Oracle".
        TASK: Scan this backend code for "N+1 Query" patterns.
        Look for loops that execute database queries/fetches inside them.
        
        CODE:
        ${content}

        OUTPUT JSON:
        {
            "n_plus_one_found": boolean,
            "locations": [
                { "line": 15, "description": "Looping over users and fetching posts" }
            ],
            "fix_suggestion": "Use .populate() or a single WHERE IN query."
        }
        `;

        const response = await aiProvider.reason(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { n_plus_one_found: false };
    }
}

export const oracleAgent = new OracleAgent();
