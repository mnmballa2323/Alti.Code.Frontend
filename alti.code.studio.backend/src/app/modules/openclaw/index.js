/**
 * Copyright (c) 2024 Inso Code
 *
 * OPENCLAW MODULE ENTRY POINT
 * Exports all deep integration services tying OpenClaw repos,
 * plus Agent-Skills, deer-flow, PageIndex, and learn-claude-code.
 */

// Core OpenClaw (openclaw/openclaw, openclaw/clawdinators, openclaw/acpx)
export * from './core.integration.js';
export * from './acpx.service.js';

// Skills (openclaw/skills + agent-skills-context + clawhub.ai)
export * from './skills.bridge.js';
export * from './clawhub.service.js';
export * from './agent-skills.service.js';

// Workflow shell (openclaw/lobster)
export * from './lobster.service.js';

// Sensory + Bots (openclaw ecosystem)
export * from './sensory.integration.js';
export * from './bots.service.js';

// New repos: Deep Research, Vectorless RAG, Nano Agent
export * from './deer-flow.service.js';
export * from './pageindex.service.js';
export * from './nano-agent.service.js';
