#!/usr/bin/env node
/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct absolute path to service
const servicePath = path.resolve(__dirname, '../app/modules/googleGenAi/googleGenAi.service.js');

// Helper to load services
const getServices = async () => {
    try {
        const genAiModule = await import(pathToFileURL(path.resolve(__dirname, '../app/modules/googleGenAi/googleGenAi.service.js')));
        const deployModule = await import(pathToFileURL(path.resolve(__dirname, '../app/modules/googleCloud/uDeployment.service.js')));
        const spannerModule = await import(pathToFileURL(path.resolve(__dirname, '../app/modules/googleCloud/spanner_graph.service.js')));
        const fsModule = await import('fs/promises');
        return {
            GoogleGenAiService: genAiModule.GoogleGenAiService,
            uDeploymentService: deployModule.uDeploymentService,
            spannerGraphService: spannerModule.spannerGraphService,
            fs: fsModule
        };
    } catch (error) {
        console.error('❌ Error loading Google Cloud Services:', error.message);
        process.exit(1);
    }
};

const help = () => {
    console.log(`
Alti Code Studio Gemini CLI (Native)

Usage:
  gemini ask <prompt>          Ask Gemini a question
  gemini chat <message>        Chat with Gemini (single turn)
  gemini deploy <path>         Trigger autonomous GCP Universal Deployment
  gemini ingest <filepath>     Ingest a source file into Google Spanner AST Graph
  gemini traverse <nodeId>     Traverse the Spanner AST Graph for execution path
  gemini help                  Show this help message
`);
};

const main = async () => {
    const args = process.argv.slice(2);
    const command = args[0];
    const input = args.slice(1).join(' ');

    if (!command || command === 'help') {
        help();
        return;
    }

    const { GoogleGenAiService, uDeploymentService, spannerGraphService, fs } = await getServices();

    if (command === 'ask') {
        if (!input) return console.error('❌ Error: Please provide a prompt.');
        try {
            const result = await GoogleGenAiService.generateContent(input);
            console.log('\n🌌 Gemini Response:\n\n', result.content);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    } else if (command === 'chat') {
        if (!input) return console.error('❌ Error: Please provide a message.');
        try {
            const result = await GoogleGenAiService.chatSession([], input);
            console.log('\n💬 Chat Response:\n\n', result.response);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    } else if (command === 'deploy') {
        if (!input) return console.error('❌ Error: Please provide a project path to deploy (e.g. ./dist).');
        console.log(`\n🚀 Triggering GCP Autonomous Universal Deployment for [${input}]...`);
        try {
            const result = await uDeploymentService.executeAutoDeploy('gcp', { path: input, serviceType: 'cloudrun' });
            console.log('\n✅ Deployment Status:\n', result);
        } catch (error) {
            console.error('❌ Deployment Error:', error.message);
        }
    } else if (command === 'ingest') {
        if (!input) return console.error('❌ Error: Please provide a file path to ingest.');
        try {
            const sourceCode = await fs.readFile(input, 'utf-8');
            const fileName = path.basename(input);
            console.log(`\n🕸️  Ingesting [${fileName}] into Google Spanner Graph...`);
            const result = await spannerGraphService.ingestSourceCodeToGraph(sourceCode, fileName);
            console.log('\n✅ Spanner Ingestion Result:\n', result);
        } catch (error) {
            console.error('❌ Spanner Ingestion Error:', error.message);
        }
    } else if (command === 'traverse') {
        if (!input) return console.error('❌ Error: Please provide a Node ID to traverse.');
        try {
            console.log(`\n🕸️  Traversing AST Graph starting at Node [${input}]...`);
            const result = await spannerGraphService.executeAstGraphTraversal(input, 3);
            console.log('\n✅ Graph Traversal Yields:\n', JSON.stringify(result, null, 2));
        } catch (error) {
            console.error('❌ Graph Traversal Error:', error.message);
        }
    } else {
        console.error(`❌ Unknown command: ${command}`);
        help();
    }
};

main();
