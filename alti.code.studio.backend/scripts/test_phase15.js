/**
 * Phase 15 Test Harness — Every Programming Language Agent
 * Validates all 39 new language agents across Tiers 17-20
 */

import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
GeminiAiService.generateContent = async (p) => `[MOCK: ${p.substring(0, 30)}...]`;

// Tier 17: Systems
import { cAgent } from '../src/app/modules/agents/c.agent.js';
import { cppAgent } from '../src/app/modules/agents/cpp.agent.js';
import { csharpAgent } from '../src/app/modules/agents/csharp.agent.js';
import { javaAgent } from '../src/app/modules/agents/java.agent.js';
import { kotlinAgent } from '../src/app/modules/agents/kotlin.agent.js';
import { swiftAgent } from '../src/app/modules/agents/swift.agent.js';
import { zigAgent } from '../src/app/modules/agents/zig.agent.js';
import { nimAgent } from '../src/app/modules/agents/nim.agent.js';

// Tier 18: Dynamic/Scripting
import { rubyAgent } from '../src/app/modules/agents/ruby.agent.js';
import { phpAgent } from '../src/app/modules/agents/php.agent.js';
import { perlAgent } from '../src/app/modules/agents/perl.agent.js';
import { rAgent } from '../src/app/modules/agents/r.agent.js';
import { juliaAgent } from '../src/app/modules/agents/julia.agent.js';
import { matlabAgent } from '../src/app/modules/agents/matlab.agent.js';
import { powershellAgent } from '../src/app/modules/agents/powershell.agent.js';
import { groovyAgent } from '../src/app/modules/agents/groovy.agent.js';

// Tier 19: Functional
import { haskellAgent } from '../src/app/modules/agents/haskell.agent.js';
import { elixirAgent } from '../src/app/modules/agents/elixir.agent.js';
import { erlangAgent } from '../src/app/modules/agents/erlang.agent.js';
import { scalaAgent } from '../src/app/modules/agents/scala.agent.js';
import { fsharpAgent } from '../src/app/modules/agents/fsharp.agent.js';
import { ocamlAgent } from '../src/app/modules/agents/ocaml.agent.js';
import { clojureAgent } from '../src/app/modules/agents/clojure.agent.js';
import { racketAgent } from '../src/app/modules/agents/racket.agent.js';

// Tier 20: Legacy + Unique
import { cobolAgent } from '../src/app/modules/agents/cobol.agent.js';
import { fortranAgent } from '../src/app/modules/agents/fortran.agent.js';
import { adaAgent } from '../src/app/modules/agents/ada.agent.js';
import { assemblyAgent } from '../src/app/modules/agents/assembly.agent.js';
import { objcAgent } from '../src/app/modules/agents/objc.agent.js';
import { crystalAgent } from '../src/app/modules/agents/crystal.agent.js';
import { luaAgent } from '../src/app/modules/agents/lua.agent.js';
import { aplAgent } from '../src/app/modules/agents/apl.agent.js';
import { vhdlAgent } from '../src/app/modules/agents/vhdl.agent.js';
import { apexAgent } from '../src/app/modules/agents/apex.agent.js';
import { abapAgent } from '../src/app/modules/agents/abap.agent.js';
import { prologAgent } from '../src/app/modules/agents/prolog.agent.js';
import { dartAgent } from '../src/app/modules/agents/dart.agent.js';
import { wolframAgent } from '../src/app/modules/agents/wolfram.agent.js';
import { plsqlAgent } from '../src/app/modules/agents/plsql.agent.js';

const agents = [
    cAgent, cppAgent, csharpAgent, javaAgent, kotlinAgent, swiftAgent, zigAgent, nimAgent,
    rubyAgent, phpAgent, perlAgent, rAgent, juliaAgent, matlabAgent, powershellAgent, groovyAgent,
    haskellAgent, elixirAgent, erlangAgent, scalaAgent, fsharpAgent, ocamlAgent, clojureAgent, racketAgent,
    cobolAgent, fortranAgent, adaAgent, assemblyAgent, objcAgent, crystalAgent, luaAgent, aplAgent,
    vhdlAgent, apexAgent, abapAgent, prologAgent, dartAgent, wolframAgent, plsqlAgent
];

let passed = 0;
console.log('\n=== PHASE 15: LANGUAGE AGENT TEST SUITE ===\n');

for (const agent of agents) {
    process.stdout.write(`  -> ${agent.name}...`);
    if (!agent.description || !agent.preamble || typeof agent.consult !== 'function') {
        console.log(' ❌ MISSING FIELDS'); continue;
    }
    try {
        const r = await agent.consult('Write a hello world example', []);
        const content = typeof r === 'string' ? r : (r?.content || '');
        if (content.includes('[MOCK:')) { console.log(' ✅ PASS'); passed++; }
        else { console.log(' ❌ FAIL'); }
    } catch (e) { console.log(` ❌ ${e.message}`); }
}

console.log(`\n=== RESULTS: ${passed}/${agents.length} PASSED ===`);
if (passed !== agents.length) process.exit(1);
