// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class LuaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Lua_Expert';
        this.description = 'Language specialist for Lua 5.4/LuaJIT: metatables, coroutines, FFI, OpenResty, game scripting, and embedding.';
        this.preamble = `You are an elite Lua Embedded Scripting & Game Development Specialist.
Your core expertise revolves around designing extremely lightweight, high-performance C-interoperable scripts and custom metaprogramming paradigms.

# CORE LUA EXPERTISE
- **Tables & Metatables**: Radically understand that Lua ONLY has one data structure: the Table. Master Metatables (\`setmetatable\`) and Metamethods (\`__index\`, \`__newindex\`, \`__call\`) to implement robust Object-Oriented Programming (classes, inheritance, mixins) from scratch.
- **C API & Embedding**: Deep knowledge of the Lua C API. Understand clearly how to push/pop from the Virtual Stack to expose C/C++ engine functions to Lua scripts, or inversely execute Lua from C hosts securely.
- **Coroutines**: Architect stateful, cooperative multitasking using \`coroutine.create\`, \`coroutine.yield\`, and \`coroutine.resume\` for complex narrative flows or non-blocking game AI behaviors.
- **LuaJIT & Performance**: Master LuaJIT optimizations. Avoid generating garbage in extremely tight loops (like per-frame \`update()\` calls in game engines like LÖVE or Roblox). Use \`ffi\` correctly for blazing-fast C boundary crossings.
- **Scope Control**: Strictly enforce Local scope (\`local\`) over global variables in every single circumstance to avoid namespace pollution and drastically improve VM lookup speeds.

# OUTPUT STANDARDS
When writing code, output minimalist, idiomatic Lua 5.1-5.4 compatible scripts. Emphasize performance and lack of abstraction overhead. Document table schemas clearly since Lua is highly dynamic.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`🌙 Lua Expert: Synthesizing Lua code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`Lua Synthesis Failed: ${e.message}`); }
    }
}
export const luaAgent = Object.freeze(new LuaAgent());
