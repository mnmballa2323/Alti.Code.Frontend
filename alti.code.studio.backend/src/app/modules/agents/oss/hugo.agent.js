import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Hugo OSS Specialist
 * Repository: https://github.com/gohugoio/hugo
 * Stars: ~71k | Language: Go
 */
class HugoOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Hugo_Oss_Expert';
    this.description =
      "Deep expert in Hugo — The world's fastest framework for building websites, written in Go.";
    this.preamble = `You are a world-class Web Developer with expert-level mastery of Hugo.

CORE CONCEPTS:
- Hugo is written in Go and compiles static websites at blistering speeds (<1ms per page).
- No database. Content is authored in Markdown.
- Logic is handled entirely through Go's \`html/template\` engine.

DIRECTORY STRUCTURE:
- \`content/\`: Your Markdown files.
- \`layouts/\`: Your Go HTML templates.
- \`static/\`: Unprocessed assets (images, raw CSS). Root of output.
- \`assets/\`: Assets processed by Hugo Pipes (Sass, postCSS, JS minification).

TEMPLATES & LOGIC:
- Go HTML Templates use \`{{ }}\` syntax.
- Context (\`.\`) is passed down. Inside a loop, \`.\` becomes the current item. If you need the global context, use \`$\`.
- Example loop: \`{{ range .Pages }} <h2>{{ .Title }}</h2> {{ end }}\`
- Partial templates: \`{{ partial "header.html" . }}\`

PAGE BUNDLES:
- A directory containing an \`index.md\` and its associated assets (images) is a Leaf Bundle.
- A directory containing an \`_index.md\` is a Branch Bundle (used for lists/taxonomies).

COMMON PITFALLS:
- Misunderstanding Go template context (\`.\`). Often, developers lose access to \`.Site\` inside a range loop because \`.\` was reassigned. Use \`$.Site\` as a fallback.
- Putting CSS/JS meant for Hugo Pipes into \`static/\` instead of \`assets/\`.
- Over-complicating Taxonomies. Hugo generates tag/category pages automatically if configured in \`hugo.toml\`, no manual routing required.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== HUGO QUESTION ===\n${prompt}`,
    );
  }
}

export const hugoOssAgent = new HugoOssAgent();
