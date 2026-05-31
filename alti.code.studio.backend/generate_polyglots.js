import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentsDir = path.join(__dirname, 'src', 'app', 'modules', 'agents');
const registryFile = path.join(agentsDir, 'agent.registry.js');

const languages = [
    { id: 'scala', name: 'Scala', desc: 'Apache Spark, Akka, and functional JVM architectures.' },
    { id: 'lua', name: 'Lua', desc: 'Game engine scripting, Roblox, and Redis embedded logic.' },
    { id: 'perl', name: 'Perl', desc: 'Legacy text processing, regex wizardry, and CGI scripts.' },
    { id: 'r_lang', name: 'R', desc: 'Statistical computing, ggplot2 data visualization, and bio-informatics.' },
    { id: 'dart', name: 'Dart', desc: 'Flutter cross-platform mobile and web application development.' },
    { id: 'fsharp', name: 'F#', desc: 'Functional programming on the .NET framework, data science.' },
    { id: 'clojure', name: 'Clojure', desc: 'Lisp dialect for the JVM, immutable data structures.' },
    { id: 'groovy', name: 'Groovy', desc: 'Gradle build scripts, Jenkins pipelines, and JVM scripting.' },
    { id: 'matlab', name: 'MATLAB', desc: 'Engineering simulations, matrix manipulations, and Simulink.' },
    { id: 'objective_c', name: 'Objective-C', desc: 'Legacy iOS/macOS frameworks and Apple runtime bridges.' },
    { id: 'assembly_x86', name: 'x86 Assembly', desc: 'Bare-metal CPU instructions, reverse engineering, shellcode.' },
    { id: 'assembly_arm', name: 'ARM Assembly', desc: 'Embedded systems, Raspberry Pi, and mobile CPU instructions.' },
    { id: 'cobol', name: 'COBOL', desc: 'Mainframe banking systems and legacy financial transactions.' },
    { id: 'fortran', name: 'Fortran', desc: 'Supercomputing, numerical weather prediction, and fluid dynamics.' },
    { id: 'pascal', name: 'Pascal', desc: 'Delphi RAD Studio and legacy educational software.' },
    { id: 'prolog', name: 'Prolog', desc: 'Logic programming, expert systems, and symbolic AI.' },
    { id: 'lisp', name: 'Lisp', desc: 'Symbolic expressions, macros, and foundational AI algorithms.' },
    { id: 'scheme', name: 'Scheme', desc: 'Minimalist Lisp dialect, SICP paradigms.' },
    { id: 'ocaml', name: 'OCaml', desc: 'Functional programming, type inference, Coq proof assistants.' },
    { id: 'julia', name: 'Julia', desc: 'High-performance numerical analysis and machine learning.' },
    { id: 'elm', name: 'Elm', desc: 'Purely functional front-end web development with zero runtime exceptions.' },
    { id: 'purescript', name: 'PureScript', desc: 'Strongly-typed functional programming compiling to JavaScript.' },
    { id: 'crystal', name: 'Crystal', desc: 'Ruby-like syntax with C-like performance and static typing.' },
    { id: 'nim', name: 'Nim', desc: 'Metaprogramming, AST macros, compiling to C/C++/JavaScript.' },
    { id: 'vala', name: 'Vala', desc: 'GNOME desktop environment development and GObject type system.' },
    { id: 'actionscript', name: 'ActionScript', desc: 'Legacy Adobe Flash animations and interactive web media.' },
    { id: 'solidity', name: 'Solidity', desc: 'Ethereum smart contracts, DeFi protocols, and Web3 logic.' },
    { id: 'vyper', name: 'Vyper', desc: 'Pythonic smart contracts for the Ethereum Virtual Machine.' },
    { id: 'move_lang', name: 'Move', desc: 'Secure smart contracts for Aptos and Sui blockchains.' },
    { id: 'rust_substrate', name: 'Rust Substrate', desc: 'Polkadot blockchain development and Web3 infrastructure.' },
    { id: 'awk', name: 'AWK', desc: 'Text stream processing and UNIX shell one-liners.' },
    { id: 'sed', name: 'sed', desc: 'Stream editor for filtering and transforming text.' },
    { id: 'tcl', name: 'Tcl', desc: 'Rapid prototyping, scripted applications, and Tk GUI toolkits.' },
    { id: 'smalltalk', name: 'Smalltalk', desc: 'Pure object-oriented programming and live coding environments.' },
    { id: 'ada', name: 'Ada', desc: 'Mission-critical avionics, defense systems, and high-integrity software.' },
    { id: 'erlang', name: 'Erlang', desc: 'Telecommunications routing, WhatsApp backend, and BEAM VM.' },
    { id: 'vhdl', name: 'VHDL', desc: 'FPGA programming, hardware description, and logic synthesis.' },
    { id: 'verilog', name: 'Verilog', desc: 'Digital circuit design, ASIC verification, and logic gates.' },
    { id: 'abap', name: 'ABAP', desc: 'SAP ERP business logic, internal tables, and reporting.' },
    { id: 'apex', name: 'Apex', desc: 'Salesforce CRM backend triggers and enterprise cloud logic.' },
    { id: 'haxe', name: 'Haxe', desc: 'Cross-platform game development compiling to all targets.' },
    { id: 'reasonml', name: 'ReasonML', desc: 'OCaml syntax for React developers (React Native).' },
    { id: 'rescript', name: 'ReScript', desc: 'Fast, typed JavaScript alternative for React ecosystems.' },
    { id: 'idris', name: 'Idris', desc: 'Dependent types, theorem proving, and functional paradigms.' },
    { id: 'agda', name: 'Agda', desc: 'Dependently typed programming and proof assistant.' },
    { id: 'coq', name: 'Coq', desc: 'Formal verification and mechanized math proofs.' },
    { id: 'brainfuck', name: 'Brainfuck', desc: 'Esoteric Turing tarpit and minimalistic state machines.' },
    { id: 'malbolge', name: 'Malbolge', desc: 'Esoteric cryptographic programming and obfuscation.' },
    { id: 'whitespace', name: 'Whitespace', desc: 'Invisible esoteric programming language.' },
    { id: 'forth', name: 'Forth', desc: 'Stack-based programming and embedded microcontroller control.' },
    { id: 'postscript', name: 'PostScript', desc: 'Page description languages and printer rendering engines.' },
    { id: 'logo', name: 'Logo', desc: 'Turtle graphics and educational spatial reasoning.' },
    { id: 'scratch', name: 'Scratch', desc: 'Block-based visual programming for early education.' },
    { id: 'racket', name: 'Racket', desc: 'Language-oriented programming and dialect creation.' },
    { id: 'hack', name: 'Hack', desc: 'HHVM performance, strictly typed PHP for Meta architectures.' },
    { id: 'd_lang', name: 'D', desc: 'Systems programming with C-like syntax and garbage collection.' },
    { id: 'q_lang', name: 'Q', desc: 'Kdb+ time-series database queries for high-frequency trading.' },
    { id: 'k_lang', name: 'K', desc: 'Array processing language for financial analytics.' },
    { id: 'apl', name: 'APL', desc: 'Multidimensional array math and symbolic finance programming.' },
    { id: 'j_lang', name: 'J', desc: 'ASCII-based array programming for mathematical analytics.' },
    { id: 'chuck', name: 'ChucK', desc: 'Strongly-timed concurrent audio programming and synthesis.' },
    { id: 'supercollider', name: 'SuperCollider', desc: 'Algorithmic music composition and audio synthesis.' },
    { id: 'max_msp', name: 'Max/MSP', desc: 'Visual programming for interactive media and sound.' },
    { id: 'puredata', name: 'Pure Data', desc: 'Open-source visual programming for multimedia.' },
    { id: 'glsl', name: 'GLSL', desc: 'OpenGL Shading Language for GPU graphics rendering.' },
    { id: 'hlsl', name: 'HLSL', desc: 'DirectX High-Level Shading Language for Windows gaming.' },
    { id: 'wgsl', name: 'WGSL', desc: 'WebGPU Shading Language for next-gen browser graphics.' },
    { id: 'cuda', name: 'CUDA', desc: 'Nvidia GPU parallel computing and tensor matrix math.' },
    { id: 'opencl', name: 'OpenCL', desc: 'Cross-platform heterogeneous computing on CPUs and GPUs.' },
    { id: 'sycl', name: 'SYCL', desc: 'Single-source C++ for heterogeneous computing.' },
    { id: 'ptx', name: 'PTX', desc: 'Parallel Thread Execution for Nvidia low-level GPU control.' },
    { id: 'webassembly', name: 'WebAssembly (WAT)', desc: 'Low-level text format for browser VM bytecode.' },
    { id: 'llvm_ir', name: 'LLVM IR', desc: 'Compiler infrastructure intermediate representation.' },
    { id: 'spir_v', name: 'SPIR-V', desc: 'Standard Portable Intermediate Representation for Vulkan.' },
    { id: 'system_verilog', name: 'SystemVerilog', desc: 'Hardware verification and logic modeling.' },
    { id: 'bluespec', name: 'Bluespec', desc: 'High-level hardware design for ASIC/FPGA.' },
    { id: 'chisel', name: 'Chisel', desc: 'Constructing Hardware in a Scala Embedded Language.' },
    { id: 'mumps', name: 'MUMPS', desc: 'Legacy healthcare database systems (Epic).' },
    { id: 'inform', name: 'Inform 7', desc: 'Natural language programming for interactive fiction.' },
    { id: 'nix', name: 'Nix', desc: 'Purely functional package management and reproducible builds.' },
    { id: 'dhall', name: 'Dhall', desc: 'Programmable, safe configuration language.' },
    { id: 'jsonnet', name: 'Jsonnet', desc: 'Data templating for complex Kubernetes manifests.' },
    { id: 'cue', name: 'CUE', desc: 'Data validation and configuration language.' },
    { id: 'rego', name: 'Rego', desc: 'Open Policy Agent (OPA) policy definition language.' },
    { id: 'starlark', name: 'Starlark', desc: 'Bazel build system configuration language.' },
    { id: 'hcl', name: 'HCL', desc: 'HashiCorp Configuration Language for Terraform state.' },
    { id: 'puppet', name: 'Puppet', desc: 'Declarative IT infrastructure automation.' },
    { id: 'chef', name: 'Chef', desc: 'Ruby-based IT infrastructure automation recipes.' },
    { id: 'ansible', name: 'Ansible (YAML)', desc: 'Agentless IT orchestration and configuration.' },
    { id: 'dockerfile', name: 'Dockerfile', desc: 'Container image build specifications.' }
];

const jsonRegistryFile = path.join(agentsDir, 'polyglots_registry.json');

async function generateAgents() {
    let dynamicAgents = [];
    try {
        const jsonContent = await fs.readFile(jsonRegistryFile, 'utf8');
        dynamicAgents = JSON.parse(jsonContent);
    } catch (err) {
        console.log('No existing polyglots_registry.json found. Creating a new one...');
    }

    for (const lang of languages) {
        const className = lang.name.replace(/[^a-zA-Z0-9]/g, '') + 'SpecialistAgent';
        const fileName = `${lang.id}_specialist.agent.js`;
        const filePath = path.join(agentsDir, fileName);

        const code = `/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ${className} extends GeminiCliBaseAgent {
    constructor() {
        super(
            '${lang.id}_specialist',
            '${lang.name} Specialist',
            'You are an elite ${lang.name} Specialist. You specialize in: ${lang.desc}'
        );
    }

    async generate${lang.name.replace(/[^a-zA-Z0-9]/g, '')}System(objective) {
        logger.info(\`💻 [${className}] Analyzing ${lang.name} requirements...\`);
        const prompt = \`Analyze the ${lang.name} requirement: \${objective}. Output valid ${lang.name} code.\`;
        try {
            const output = await this._invoke(prompt, "N/A - ${lang.name} Target");
            return output.replace(/\`\`\`[a-zA-Z0-9_-]*|\`\`\`/gi, '').trim();
        } catch (err) {
            logger.error(\`❌ [${className}] Failed: \${err.message}\`);
            throw err;
        }
    }
}
export const ${className}Instance = new ${className}();
`;

        await fs.writeFile(filePath, code);

        const newAgentDef = {
            name: `${lang.id}_specialist`,
            description: `${lang.name} Specialist. ${lang.desc}`,
            queue: `${lang.id}-queue`,
            capabilities: [lang.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), 'programming-language', 'polyglot'],
            version: '1.0.0'
        };

        const existingIndex = dynamicAgents.findIndex(a => a.name === newAgentDef.name);
        if (existingIndex !== -1) {
            dynamicAgents[existingIndex] = newAgentDef;
        } else {
            dynamicAgents.push(newAgentDef);
        }
    }

    await fs.writeFile(jsonRegistryFile, JSON.stringify(dynamicAgents, null, 2), 'utf8');
    console.log(`Successfully generated ${languages.length} polyglot agents and updated polyglots_registry.json.`);
}

generateAgents().catch(console.error);
