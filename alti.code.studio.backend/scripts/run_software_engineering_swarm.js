/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * The Ultimate Software Engineering Swarm Runner
 * Executes a full multi-agent developer pipeline with deterministic mocks.
 */

import { SwarmEngine } from '../src/app/modules/agents/custom_swarm_orchestrator.js';
import { 
    SwarmArchitectAgent, 
    SwarmTddCoderAgent, 
    SwarmQaTesterAgent,
    SwarmSecurityAuditorAgent,
    SwarmDevOpsEngineerAgent
} from '../src/app/modules/agents/software_engineering_swarm.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

async function runSwarm() {
    console.log('🚀 INITIALIZING WORLD-CLASS FIVE-AGENT SOFTWARE ENGINEERING SWARM...');
    
    const engine = new SwarmEngine();
    
    // ── Mock the AI Provider for Deterministic Swarm Trace ──
    console.log('🛠️ Mocking AI Provider for autonomous pipeline execution across all 5 agents...');
    let turnCount = 0;
    
    aiProvider.client = {}; // mock client
    aiProvider.reason = async (prompt, options = {}) => {
        turnCount++;
        
        if (turnCount === 1) {
            console.log('\n[Mock LLM - SwarmArchitect] Designing systems architecture and initiating handoff to Coder...');
            // 1. Call the design tool
            const designResult = await options.onToolCall('design_system_architecture', {
                featureName: 'Secure JWT Session Token Rotation Manager',
                requirements: 'Zero-trust security, Redis clustering compatibility, O(1) latency targets.'
            });
            // 2. Call the handoff tool
            const handoffResult = await options.onToolCall('handoff_to_coder', {});
            return `System Architecture has been fully mapped out:\n${designResult}\n\nI am now handing off these specifications to our lead SwarmTddCoder agent.`;
            
        } else if (turnCount === 2) {
            console.log('\n[Mock LLM - SwarmTddCoder] Generating pure MIT-licensed, highly optimized Node.js code and initiating handoff to QA Tester...');
            // 1. Call the code generator tool
            const codeResult = await options.onToolCall('generate_permissive_code', {
                specifications: 'Secure JWT Session Token Rotation Manager design specs.'
            });
            // 2. Call the handoff tool
            const handoffResult = await options.onToolCall('handoff_to_qa_tester', {});
            return `Pristine implementation successfully compiled:\n${codeResult}\n\nI am now handing off the source code to our SwarmQaTester agent.`;
            
        } else if (turnCount === 3) {
            console.log('\n[Mock LLM - SwarmQaTester] Designing edge-case integration tests and initiating handoff to Security Auditor...');
            // 1. Call the test generation tool
            const testResult = await options.onToolCall('generate_integration_tests', {
                sourceCode: 'import crypto from "crypto"; // SessionTokenManager'
            });
            // 2. Call the handoff tool
            const handoffResult = await options.onToolCall('handoff_to_security_auditor', {});
            return `Comprehensive integration tests created successfully:\n${testResult}\n\nI am now handing off the source code and tests to our SwarmSecurityAuditor agent.`;
            
        } else if (turnCount === 4) {
            console.log('\n[Mock LLM - SwarmSecurityAuditor] Running static analysis, secret scans, and initiating handoff to DevOps...');
            // 1. Call the verification tool
            const auditResult = await options.onToolCall('verify_security_compliance', {
                code: 'import crypto from "crypto";' // simple code pass for mock
            });
            // 2. Call the handoff tool
            const handoffResult = await options.onToolCall('handoff_to_devops', {});
            return `Zero-trust security audit and license compliance scan completed:\n${auditResult}\n\nI am now handing off the verified code and tests to our SwarmDevOpsEngineer agent.`;
            
        } else if (turnCount === 5) {
            console.log('\n[Mock LLM - SwarmDevOpsEngineer] Generating Docker containers, deployment configs, and signing off...');
            // 1. Call the deployment tool
            const deployResult = await options.onToolCall('generate_deployment_spec', {
                serviceName: 'session-token-rotation'
            });
            // 2. Call the sprint sign-off tool
            const signOffResult = await options.onToolCall('sign_off_sprint', {});
            return `DevOps infrastructure and containers generated successfully:\n${deployResult}\n\nVerdict: ${signOffResult}`;
        }
        
        return "Task complete.";
    };

    console.log('\n======================================================================');
    console.log('🧪 TEST: Autonomous 5-Agent Collaborative Software Development Pipeline');
    console.log('======================================================================');
    
    const userRequest = {
        role: 'user',
        content: 'Please build a highly secure, scalable Session Token Rotation Service for our Express backend.'
    };

    try {
        const context = {};
        const result = await engine.run(SwarmArchitectAgent, [userRequest], context);
        
        console.log('\n======================================================================');
        console.log('📊 MULTI-AGENT PIPELINE EXECUTION SUMMARY');
        console.log('======================================================================');
        console.log(`- Entrypoint Agent:     [SwarmArchitect]`);
        console.log(`- Final Sign-off Agent:  [${result.agent.name}]`);
        console.log(`- Total Pipeline Turns:  ${result.history.length}`);
        
        console.log('\n📜 Swarm Engine Trace Logs:');
        result.history.forEach((step, idx) => {
            console.log(`\n----------------------------------------------------------------------`);
            console.log(`Turn ${step.turn} [Active Agent: ${step.agent}]:`);
            console.log(`----------------------------------------------------------------------`);
            step.executedTools.forEach(t => {
                if (t.handoff) {
                    console.log(`  🔄 Tool [${t.tool}] -> Autonomous Handoff to specialized [${t.handoff}]`);
                } else {
                    console.log(`  🔧 Tool [${t.tool}] executed successfully.`);
                }
            });
            console.log(`\n  Response:\n"${step.response.trim()}"`);
        });

        console.log('\n======================================================================');
        console.log('🎉 SWARM SPRINT VERDICT');
        console.log('======================================================================');
        if (
            result.agent.name === 'SwarmDevOpsEngineer' && 
            context.architectureDesign && 
            context.generatedCode && 
            context.testSuite &&
            context.securityAudit &&
            context.devOpsSpec &&
            context.sprintSignOff
        ) {
            console.log('🎉 PIPELINE PASSED! The Architect designed it, the Coder implemented it, the QA Tester tested it, the Security Auditor verified it, and the DevOps Engineer containerized and signed off.');
            console.log('   All intermediate states are recorded in the shared context.');
            process.exit(0);
        } else {
            console.error('🚨 PIPELINE FAILED! State transitions or signatures are missing.');
            process.exit(1);
        }

    } catch (e) {
        console.error('Pipeline execution crashed:', e);
        process.exit(1);
    }
}

runSwarm();
