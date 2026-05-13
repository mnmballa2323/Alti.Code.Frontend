/**
 * Test Harness for Tier 8 Micro-Agents
 */
import { linterAgent } from '../src/app/modules/agents/linter.agent.js';
import { formatterAgent } from '../src/app/modules/agents/formatter.agent.js';
import { secretScannerAgent } from '../src/app/modules/agents/secret_scanner.agent.js';
import { envValidatorAgent } from '../src/app/modules/agents/env_validator.agent.js';
import { importSorterAgent } from '../src/app/modules/agents/import_sorter.agent.js';
import fs from 'fs/promises';
import path from 'path';

async function runTests() {
    console.log("=== STARTING TIER 8 MICRO-AGENT TESTS ===\n");

    // 1. Formatter Test
    const uglyCode = `function test  (  )   {  const x=1 ; return x }`;
    console.log("-> Testing FormatterAgent:");
    const cleanOutput = await formatterAgent.formatCodeString(uglyCode, 'typescript');
    console.log(cleanOutput.includes('function test') && !cleanOutput.includes('test  (  )') ? "✅ Formatter PASS" : "❌ Formatter FAIL");

    // 2. Secret Scanner Test
    console.log("\n-> Testing SecretScannerAgent:");
    const badPayload = `const token = "ghp_abc1234567890abcdefghijklmnopqrstuv"; const myPW = 'password123';`;
    const scanResult = secretScannerAgent.scanString(badPayload);
    console.log(!scanResult.safe && scanResult.leaks.length > 0 ? "✅ SecretScanner PASS (Leaks detected)" : "❌ SecretScanner FAIL (Missed leak)");

    // 3. Env Validator Test
    console.log("\n-> Testing EnvValidatorAgent:");
    const mockEnvPath = path.join(process.cwd(), 'mock_test.env');
    await fs.writeFile(mockEnvPath, `NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_test_1234\nDB_PASS=password\nEMPTY_KEY=\nMALFORMED_LINE\n`, 'utf8');
    const envResult = await envValidatorAgent.validateEnvConfiguration(mockEnvPath);
    console.log(!envResult.valid && envResult.errors.length > 0 ? "✅ EnvValidator PASS (Caught bad keys)" : "❌ EnvValidator FAIL");
    await fs.unlink(mockEnvPath); // cleanup

    // 4. Import Sorter Test
    console.log("\n-> Testing ImportSorterAgent:");
    const mockCodePath = path.join(process.cwd(), 'mock_test_imports.js');
    await fs.writeFile(mockCodePath, `
import { myFunc } from './local.js';
import React from 'react';
import axios from 'axios';
import { Component } from '@/components/Component';

export function test() { return true; }
    `.trim(), 'utf8');

    await importSorterAgent.sortImports(mockCodePath);
    const sortedCode = await fs.readFile(mockCodePath, 'utf8');
    const lines = sortedCode.split('\n');
    const reactIndex = lines.findIndex(l => l.includes('react'));
    const axiosIndex = lines.findIndex(l => l.includes('axios'));
    const absoluteIndex = lines.findIndex(l => l.includes('@/components'));
    const relativeIndex = lines.findIndex(l => l.includes('./local.js'));

    if (reactIndex < axiosIndex && axiosIndex < absoluteIndex && absoluteIndex < relativeIndex) {
        console.log("✅ ImportSorter PASS");
    } else {
        console.log("❌ ImportSorter FAIL");
        console.log("Output was:\n" + sortedCode);
    }
    await fs.unlink(mockCodePath); // cleanup

    console.log("\n=== ALL TESTS COMPLETED ===");
}

runTests().catch(console.error);
