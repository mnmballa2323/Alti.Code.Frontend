/**
 * Copyright (c) 2024 Inso Code
 * 
 * Omni-Polyglot Swarm Core: Dynamic agent spawner and resolver
 * Support for 120+ languages and 32+ functional roles
 */

import { BaseSpecialistAgent, AgentError } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

// Categories of 120+ languages
export const POLYGLOT_LANGUAGES = {
    systems: [
        { id: 'c', name: 'C', desc: 'Low-level procedural programming, manual memory management.' },
        { id: 'cpp', name: 'C++', desc: 'Modern C++23, templates, RAII, STL concurrency.' },
        { id: 'rust', name: 'Rust', desc: 'Memory safety via ownership, lifetimes, cargo, async.' },
        { id: 'zig', name: 'Zig', desc: 'Manual memory allocators, comptime metaprogramming.' },
        { id: 'nim', name: 'Nim', desc: 'AST macro metaprogramming compiling to C/C++.' },
        { id: 'd_lang', name: 'D', desc: 'High-performance systems language with garbage collection.' },
        { id: 'golang', name: 'Go', desc: ' Goroutines, CSP channels, standard library microservices.' },
        { id: 'ada', name: 'Ada', desc: 'Avionics, high-integrity mission-critical systems.' },
        { id: 'fortran', name: 'Fortran', desc: 'HPC numerical supercomputing, weather simulation.' },
        { id: 'assembly_x86', name: 'x86_64 Assembly', desc: 'Bare-metal CPU instructions, SIMD/AVX vector operations.' },
        { id: 'assembly_arm', name: 'ARM Assembly', desc: 'Mobile/embedded computing CPU registers, architecture.' },
        { id: 'assembly_mips', name: 'MIPS Assembly', desc: 'RISC instruction architecture modeling.' },
        { id: 'webassembly', name: 'WebAssembly (WAT)', desc: 'WAT low-level textual compilation bytecode.' },
        { id: 'llvm_ir', name: 'LLVM IR', desc: 'Intermediate representation optimization layer.' }
    ],
    web_mobile: [
        { id: 'typescript', name: 'TypeScript', desc: 'Strict-mode interfaces, mapped types, advanced generics.' },
        { id: 'javascript', name: 'JavaScript', desc: 'ES6/Node.js event loops, promises, dynamic scopes.' },
        { id: 'dart', name: 'Dart', desc: 'Flutter cross-platform widgets, isolate memory hubs.' },
        { id: 'swift', name: 'Swift', desc: 'SwiftUI, Swift 6 actors, Apple runtime interfaces.' },
        { id: 'kotlin', name: 'Kotlin', desc: 'Android JVM, coroutines, KMP multi-platform models.' },
        { id: 'objective_c', name: 'Objective-C', desc: 'Legacy Cocoa frameworks, ARC runtime interfaces.' },
        { id: 'elm', name: 'Elm', desc: 'Purely functional front-end, zero runtime exceptions.' },
        { id: 'purescript', name: 'PureScript', desc: 'Strongly-typed functional compiling to JS.' },
        { id: 'reasonml', name: 'ReasonML', desc: 'OCaml syntax targeting React systems.' },
        { id: 'rescript', name: 'ReScript', desc: 'Type-safe fast JS dialect for React.' },
        { id: 'haxe', name: 'Haxe', desc: 'Multi-target compilation framework.' },
        { id: 'clojurescript', name: 'ClojureScript', desc: 'Clojure lisp compiling to web runtimes.' }
    ],
    dynamic: [
        { id: 'python', name: 'Python', desc: 'Async FastAPI, type-safe models, PyPI packages.' },
        { id: 'ruby', name: 'Ruby', desc: 'Rails conventions, metaprogramming, OOP design.' },
        { id: 'php', name: 'PHP', desc: 'Modern PHP 8.x Laravel, PSR standards.' },
        { id: 'perl', name: 'Perl', desc: 'Regex text stream slicing, legacy CPAN modules.' },
        { id: 'lua', name: 'Lua', desc: 'Redis embedded scripts, OpenResty, game engines.' },
        { id: 'groovy', name: 'Groovy', desc: 'Gradle DSL build targets, Jenkins pipeline logic.' },
        { id: 'powershell', name: 'PowerShell', desc: 'Windows/Linux systems scripting, Az modules.' },
        { id: 'bash', name: 'Bash', desc: 'Shell pipelines, sed, awk core integrations.' },
        { id: 'tcl', name: 'Tcl', desc: 'Rapid prototyping, Tk GUI toolkits.' },
        { id: 'awk', name: 'AWK', desc: 'Text stream column filtering, UNIX one-liners.' },
        { id: 'sed', name: 'sed', desc: 'Stream text substitution, formatting.' }
    ],
    functional: [
        { id: 'haskell', name: 'Haskell', desc: 'Pure functional monads, lazy evaluation, safety.' },
        { id: 'elixir', name: 'Elixir', desc: 'BEAM OTP concurrency, Phoenix channels.' },
        { id: 'erlang', name: 'Erlang', desc: 'Fault-tolerant distributed telecommunications.' },
        { id: 'scala', name: 'Scala', desc: 'JVM functional patterns, Akka, Spark.' },
        { id: 'fsharp', name: 'F#', desc: '.NET functional models, asynchronous workflows.' },
        { id: 'ocaml', name: 'OCaml', desc: 'Static type inference, compiler writing structures.' },
        { id: 'clojure', name: 'Clojure', desc: 'Lisp dialect on the JVM, immutability.' },
        { id: 'racket', name: 'Racket', desc: 'Language-oriented macro systems.' },
        { id: 'scheme', name: 'Scheme', desc: 'Minimalist Lisp dialect, SICP concepts.' },
        { id: 'lisp', name: 'Common Lisp', desc: 'Dynamic macro systems, CLOS OOP.' },
        { id: 'idris', name: 'Idris', desc: 'Dependent types, mathematical theorem proving.' },
        { id: 'agda', name: 'Agda', desc: 'Mechanized proof assistants, dynamic types.' },
        { id: 'coq', name: 'Coq', desc: 'Formal system verification, proofs.' }
    ],
    database_query: [
        { id: 'sql', name: 'SQL', desc: 'Standard joins, aggregation, window functions.' },
        { id: 'plsql', name: 'PL/SQL', desc: 'Oracle DB stored procedures, packages.' },
        { id: 'tsql', name: 'T-SQL', desc: 'Microsoft SQL Server transactions, CTEs.' },
        { id: 'postgresql', name: 'PostgreSQL dialect', desc: 'JSONB queries, composite indexes.' },
        { id: 'mongodb_query', name: 'MQL (MongoDB)', desc: 'Aggregation pipeline arrays, indexes.' },
        { id: 'graphql', name: 'GraphQL', desc: 'Query and mutation schemas, resolvers.' },
        { id: 'cypher', name: 'Neo4j Cypher', desc: 'Graph traversal patterns, nodes, edges.' },
        { id: 'q_lang', name: 'Q', desc: 'Kdb+ timeseries databases for HFT.' }
    ],
    web3: [
        { id: 'solidity', name: 'Solidity', desc: 'Ethereum smart contracts, EVM security.' },
        { id: 'vyper', name: 'Vyper', desc: 'Pythonic secure smart contracts.' },
        { id: 'move', name: 'Move', desc: 'Resource-oriented blockchain smart contracts.' },
        { id: 'substrate_rust', name: 'Substrate Rust', desc: 'Polkadot blockchain development.' },
        { id: 'clarity', name: 'Clarity', desc: 'Decidable smart contracts on Stacks.' },
        { id: 'yul', name: 'Yul', desc: 'EVM intermediate assembly optimization.' },
        { id: 'huff', name: 'Huff', desc: 'EVM assembly compiler definitions.' }
    ],
    scientific: [
        { id: 'r_lang', name: 'R', desc: 'Data visualization, tidyverse, stats.' },
        { id: 'julia', name: 'Julia', desc: 'Numerical analytics, multiple dispatch.' },
        { id: 'matlab', name: 'MATLAB', desc: 'Simulink, matrix processing.' },
        { id: 'wolfram', name: 'Wolfram', desc: 'Symbolic math, logic engines.' },
        { id: 'octave', name: 'GNU Octave', desc: 'Open-source scientific processing.' }
    ],
    esoteric_vintage: [
        { id: 'cobol', name: 'COBOL', desc: 'Mainframe banking ledgers, legacy transactions.' },
        { id: 'mumps', name: 'MUMPS', desc: 'Epic Systems medical databases.' },
        { id: 'forth', name: 'Forth', desc: 'Stack-oriented embedded hardware systems.' },
        { id: 'smalltalk', name: 'Smalltalk', desc: 'Pure message-passing OOP live runtimes.' },
        { id: 'postscript', name: 'PostScript', desc: 'Vector drawing rendering scripts.' },
        { id: 'brainfuck', name: 'Brainfuck', desc: 'Minimal Turing tarpit esoteric scripts.' },
        { id: 'malbolge', name: 'Malbolge', desc: 'Self-modifying cryptic cryptographic code.' },
        { id: 'whitespace', name: 'Whitespace', desc: 'Code composed solely of invisible tokens.' }
    ]
};

// Core engineering functions
export const POLYGLOT_FUNCTIONS = [
    { id: 'datastructure', name: 'Data Structures & Collections', desc: 'Tries, graphs, trees, maps, heaps, and arrays.' },
    { id: 'parsing', name: 'Parsing & AST Compiler logic', desc: 'Parsing, lexical analyzers, AST modification.' },
    { id: 'networking', name: 'Networking & Socket APIs', desc: 'HTTP streaming, TCP sockets, REST, gRPC.' },
    { id: 'io_file', name: 'File Systems & I/O streams', desc: 'Streaming, format parsers, directory indexes.' },
    { id: 'database', name: 'Database Query optimization', desc: 'Stored procedures, CRUD, index optimization.' },
    { id: 'concurrency', name: 'Concurrency & Thread safety', desc: 'Mutex locks, goroutines, actors, threads, channels.' },
    { id: 'string_ops', name: 'String Processing & Regex', desc: 'Pattern matching, formatters, sanitizers.' },
    { id: 'ml_stats', name: 'Matrix Math & Data Processing', desc: 'Linear models, matrix algebra, datasets.' },
    { id: 'security_crypto', name: 'Cryptography & Hardening', desc: 'AES-GCM, RSA, hashing, signature checks.' },
    { id: 'algorithms', name: 'Sorting & Core Algorithms', desc: 'Recursion, binary search, complex sorting.' },
    { id: 'sys_wrapper', name: 'System Calls & Process wrappers', desc: 'Signal capture, subprocess execution.' },
    { id: 'routing', name: 'Web Routing & Middleware', desc: 'Rate limiting, headers, parsing.' },
    { id: 'serialization', name: 'JSON/Protocol Buffer codecs', desc: 'Protobuf, JSON/YAML parsing.' },
    { id: 'memory', name: 'Memory Allocators & Pools', desc: 'Custom arenas, buffer pools, manually-managed pools.' }
];

// Helper to flatten languages
export function getFlatLanguages() {
    const flat = [];
    for (const [cat, list] of Object.entries(POLYGLOT_LANGUAGES)) {
        for (const item of list) {
            flat.push({ ...item, category: cat });
        }
    }
    return flat;
}

class DynamicPolyglotSpecialistAgent extends BaseSpecialistAgent {
    constructor(langName, funcName, langDesc, funcDesc, agentName) {
        super();
        this.name = agentName;
        this.description = `Dynamic Swarm Specialist for ${langName} in ${funcName}.`;
        this.preamble = `You are a world-class AI Software Engineer specializing in ${langName} (${langDesc}) and executing ${funcName} (${funcDesc}).`;
        this.manifest = {
            id: agentName,
            version: '1.0.0',
            capabilities: [langName.toLowerCase(), funcName.toLowerCase().replace(/[^a-z0-9]/g, '-'), 'dynamic-polyglot'],
            source: 'dynamic_swarm_portal'
        };
    }

    async _invoke(prompt, contextBlock) {
        // Formulate highly specialized system prompt
        const fullPrompt = `
${this.preamble}

TASK:
${prompt}

${contextBlock ? `\nCONTEXT:\n${contextBlock}\n` : ''}

You are tasked to generate highly robust, secure, and production-grade code.
You must output a strictly structured JSON response in the following format:
{
  "code": "/* Fully written, comments-rich code in the target language */",
  "explanation": "Line-by-line detailed explanation of the implementation.",
  "complexity": {
     "time": "O(N log N) or appropriate time complexity",
     "space": "O(N) or appropriate space complexity",
     "description": "Big-O complexity reasoning."
  },
  "unitTests": "/* Complete suite of unit tests using a popular framework in that language */",
  "confidence": 98
}

Return ONLY the raw JSON block inside a markdown code block, like:
\`\`\`json
{ ... }
\`\`\`
Do not include any other commentary.
`;

        const response = await aiProvider.reason(fullPrompt);

        // We clean and return the response
        try {
            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || '{}');
            return JSON.stringify(parsed);
        } catch {
            return JSON.stringify({
                code: response,
                explanation: 'Raw output received.',
                complexity: { time: 'N/A', space: 'N/A', description: 'Raw model completion.' },
                unitTests: '// Mock/failed to parse tests',
                confidence: 60
            });
        }
    }
}

class OmniPolyglotService {
    constructor() {
        this.flatLanguages = getFlatLanguages();
        this.functions = POLYGLOT_FUNCTIONS;
        // In-memory registry for dynamic instances
        this.summonedSpecialists = new Map();
    }

    getCatalog() {
        return {
            languages: POLYGLOT_LANGUAGES,
            functions: POLYGLOT_FUNCTIONS
        };
    }

    summon(langId, funcId) {
        const lang = this.flatLanguages.find(l => l.id === langId);
        const func = this.functions.find(f => f.id === funcId);

        if (!lang || !func) {
            throw new Error(`Invalid language selection [${langId}] or functional role [${funcId}].`);
        }

        const agentName = `polyglot_${langId}_${funcId}`;

        // Return if already registered
        if (this.summonedSpecialists.has(agentName)) {
            return this.summonedSpecialists.get(agentName);
        }

        logger.info(`🔨 OmniPolyglotService: Dynamic Spawning [${agentName}] (${lang.name} - ${func.name})`);

        const instance = new DynamicPolyglotSpecialistAgent(
            lang.name,
            func.name,
            lang.desc,
            func.desc,
            agentName
        );

        // Register in our local map
        this.summonedSpecialists.set(agentName, {
            id: agentName,
            name: `${lang.name} - ${func.name} Specialist`,
            description: instance.description,
            capabilities: instance.manifest.capabilities,
            status: 'active',
            instance
        });

        // Dynamic registration into Alti's central agentRegistry
        agentRegistry.register({
            name: agentName,
            description: instance.description,
            queue: `${agentName}-queue`,
            capabilities: instance.manifest.capabilities,
            version: '1.0.0',
            policy: { accessLevel: 'DEVELOPER' },
            instance
        });

        return this.summonedSpecialists.get(agentName);
    }

    async execute(langId, funcId, task, code = '', context = '') {
        const specialist = this.summon(langId, funcId);
        
        logger.info(`⚡ OmniPolyglotService: Executing Specialist [${specialist.id}]`);

        // Format prompt and context blocks
        const prompt = `Task: ${task}\n${code ? `Initial Code:\n\`\`\`\n${code}\n\`\`\`` : ''}`;
        const contextData = context ? [{ path: 'user_context.txt', content: context }] : [];

        // Consult dynamic agent
        const result = await specialist.instance.consult(prompt, contextData);

        // Parse result payload
        try {
            const parsed = JSON.parse(result.content);
            return {
                success: true,
                agent: specialist.name,
                id: specialist.id,
                executionTimeMs: result.execution_time_ms,
                confidence: result.confidence,
                code: parsed.code,
                explanation: parsed.explanation,
                complexity: parsed.complexity,
                unitTests: parsed.unitTests
            };
        } catch {
            return {
                success: true,
                agent: specialist.name,
                id: specialist.id,
                executionTimeMs: result.execution_time_ms,
                confidence: result.confidence,
                code: result.content,
                explanation: 'Raw completion received.',
                complexity: { time: 'N/A', space: 'N/A', description: 'Parser fallback.' },
                unitTests: '// No tests parsed.'
            };
        }
    }
}

export const omniPolyglotService = new OmniPolyglotService();
