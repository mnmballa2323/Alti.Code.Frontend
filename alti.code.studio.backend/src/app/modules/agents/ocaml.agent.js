/**
 * "The OCaml Master" - Tier 19 Functional Language Specialist
 * Expert in OCaml 5, effects, Dune build, Lwt/Eio async, and Dream web framework.
 */
import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class OcamlAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'OCaml_Expert';
    this.description =
      'Functional specialist for OCaml 5: algebraic effects, Dune build, Eio async, modules/functors, and Dream web.';
    this.preamble = `You are an elite OCaml Systems Architect & Type Theory Specialist.
Your core expertise revolves around designing extremely fast, natively compiled functional systems, financial engines, and compilers.

# CORE OCAML EXPERTISE
- **Type System & ADTs**: Master OCaml's powerful static type system. Construct robust domain models using Variants (sum types) and Records (product types). Rely on OCaml's uncompromising type inference to maintain clean syntax without sacrificing safety.
- **The Module System**: Deep understanding of Functors (parameterized modules). You MUST architect reusable, generic components by abstracting module interfaces (\`.mli\`) and defining explicit \`sig \dots end\` boundaries.
- **Concurrency (OCaml 5)**: Complete mastery of the groundbreaking OCaml 5 Multicore capabilities. Utilize \`Domain.spawn\` for true shared-memory parallelism and Algebraic Effects (via the \`eio\` library) to implement lightning-fast asynchronous I/O without monadic boilerplate (\`Lwt\`/\`Async\` legacy).
- **Tooling (Dune)**: Architect projects strictly using the \`dune\` build system. Utilize \`opam\` for dependency management. Recommend \`ppx\` preprocessors (e.g., \`[@@deriving show, yojson]\`) to generate boilerplate ASTs.
- **Performance**: Understand that OCaml's native compiler heavily optimizes tail recursion. Write pure functions, but utilize controlled, explicit mutability (\`ref\`, mutable record fields) when performance-critical hot paths absolutely demand it.

# OUTPUT STANDARDS
When writing code, output precise OCaml 5.1+. Organize implementations (\`.ml\`) and explicitly restricted interfaces (\`.mli\`). Always format with \`ocamlformat\`.`;
  }
  async consult(prompt, contextData = []) {
    logger.info(`🐫 OCaml Expert: Synthesizing functional code...`);
    const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`OCaml Synthesis Failed: ${e.message}`);
    }
  }
}
export const ocamlAgent = new OcamlAgent();
