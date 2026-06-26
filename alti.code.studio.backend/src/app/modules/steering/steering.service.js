/**
 * Steering Service — Persistent workspace context via markdown files
 *
 * Steering files give the AI persistent knowledge about your workspace.
 * Stored in .alti/steering/ as markdown files with YAML frontmatter.
 *
 * Inclusion modes:
 *  - always:      Always injected into every prompt (default)
 *  - conditional: Injected only when currentFile matches filePatterns
 *  - manual:      Only when explicitly @-referenced by user
 *  - auto:        Injected by AI relevance detection (heuristic)
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const VALID_SCOPES = ['workspace', 'global'];
const VALID_INCLUSION = ['always', 'conditional', 'manual', 'auto'];

class SteeringService {
  constructor() {
    this.steeringDir = path.join(process.cwd(), '.alti', 'steering');
  }

  async _ensureDir() {
    await fs.mkdir(this.steeringDir, { recursive: true });
  }

  _parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };
    const meta = {};
    for (const line of match[1].split('\n')) {
      const [key, ...rest] = line.split(':');
      if (key?.trim()) {
        let val = rest.join(':').trim();
        // Parse array values like [*.ts, *.tsx]
        if (val.startsWith('[') && val.endsWith(']')) {
          val = val
            .slice(1, -1)
            .split(',')
            .map(v => v.trim());
        }
        meta[key.trim()] = val;
      }
    }
    return { meta, body: match[2].trim() };
  }

  _buildFrontmatter(meta) {
    const lines = ['---'];
    for (const [k, v] of Object.entries(meta)) {
      if (Array.isArray(v)) {
        lines.push(`${k}: [${v.join(', ')}]`);
      } else {
        lines.push(`${k}: ${v}`);
      }
    }
    lines.push('---');
    return lines.join('\n');
  }

  _safeFilename(name) {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-') + '.md'
    );
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  /**
   * Create a new steering file.
   * @param {string} name - Human-readable name (becomes filename)
   * @param {string} content - Markdown content (without frontmatter)
   * @param {object} [options]
   * @param {'workspace'|'global'} [options.scope='workspace']
   * @param {'always'|'conditional'|'manual'|'auto'} [options.inclusion='always']
   * @param {string[]} [options.filePatterns=[]] - For conditional inclusion
   */
  async createSteering(name, content, options = {}) {
    if (!name?.trim()) throw new Error('"name" is required.');
    if (!content?.trim()) throw new Error('"content" is required.');

    const scope = options.scope || 'workspace';
    const inclusion = options.inclusion || 'always';
    const filePatterns = options.filePatterns || [];

    if (!VALID_SCOPES.includes(scope))
      throw new Error(`scope must be: ${VALID_SCOPES.join(', ')}`);
    if (!VALID_INCLUSION.includes(inclusion))
      throw new Error(`inclusion must be: ${VALID_INCLUSION.join(', ')}`);

    await this._ensureDir();
    const filename = this._safeFilename(name);
    const filePath = path.join(this.steeringDir, filename);

    // Check if file exists already
    try {
      await fs.access(filePath);
      throw new Error(
        `Steering file "${filename}" already exists. Use update instead.`,
      );
    } catch (e) {
      if (e.message.includes('already exists')) throw e;
      // File doesn't exist — proceed
    }

    const frontmatter = this._buildFrontmatter({
      name,
      scope,
      inclusion,
      ...(filePatterns.length > 0 ? { filePatterns } : {}),
    });

    const fullContent = `${frontmatter}\n\n${content.trim()}`;
    await fs.writeFile(filePath, fullContent);

    logger.info(`🧭 Steering: created "${filename}" (${scope}, ${inclusion})`);
    return { filename, scope, inclusion, filePatterns, content };
  }

  /**
   * List all steering files with metadata.
   */
  async listSteering() {
    await this._ensureDir();
    try {
      const entries = await fs.readdir(this.steeringDir, {
        withFileTypes: true,
      });
      const files = await Promise.all(
        entries
          .filter(e => e.isFile() && e.name.endsWith('.md'))
          .map(async e => {
            const raw = await fs.readFile(
              path.join(this.steeringDir, e.name),
              'utf-8',
            );
            const { meta, body } = this._parseFrontmatter(raw);
            const stat = await fs.stat(path.join(this.steeringDir, e.name));
            return {
              filename: e.name,
              name: meta.name || e.name,
              scope: meta.scope || 'workspace',
              inclusion: meta.inclusion || 'always',
              filePatterns: meta.filePatterns || [],
              sizeBytes: stat.size,
              updatedAt: stat.mtime.toISOString(),
              preview: body.slice(0, 120) + (body.length > 120 ? '...' : ''),
            };
          }),
      );
      return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [];
    }
  }

  /**
   * Get the full content of a steering file.
   * @param {string} filename
   */
  async getSteering(filename) {
    await this._ensureDir();
    const filePath = path.join(this.steeringDir, filename);
    const raw = await fs.readFile(filePath, 'utf-8');
    const { meta, body } = this._parseFrontmatter(raw);
    return {
      filename,
      name: meta.name || filename,
      scope: meta.scope || 'workspace',
      inclusion: meta.inclusion || 'always',
      filePatterns: meta.filePatterns || [],
      content: body,
      raw,
    };
  }

  /**
   * Update the content and/or metadata of a steering file.
   * @param {string} filename
   * @param {string} content - New markdown content
   * @param {object} [metaPatch] - Updated metadata fields
   */
  async updateSteering(filename, content, metaPatch = {}) {
    await this._ensureDir();
    const filePath = path.join(this.steeringDir, filename);
    let existingMeta = {};
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      existingMeta = this._parseFrontmatter(raw).meta;
    } catch {
      // File might not exist yet
    }

    const mergedMeta = { ...existingMeta, ...metaPatch };
    const frontmatter = this._buildFrontmatter(mergedMeta);
    const fullContent = `${frontmatter}\n\n${content.trim()}`;
    await fs.writeFile(filePath, fullContent);

    logger.info(`🧭 Steering: updated "${filename}"`);
    return this.getSteering(filename);
  }

  /**
   * Delete a steering file.
   * @param {string} filename
   */
  async deleteSteering(filename) {
    await this._ensureDir();
    const filePath = path.join(this.steeringDir, filename);
    await fs.rm(filePath, { force: true });
    logger.info(`🧭 Steering: deleted "${filename}"`);
  }

  // ─── CONTEXT INJECTION ───────────────────────────────────────────────────

  /**
   * Build the active steering context to inject into LLM prompts.
   * @param {object} [opts]
   * @param {string} [opts.currentFile] - Current file being edited (for conditional inclusion)
   * @param {string} [opts.userPrompt] - User's prompt (for auto inclusion)
   * @param {string[]} [opts.manualIncludes] - Filenames explicitly @-referenced by user
   * @returns {Promise<string>} - Combined steering context as markdown
   */
  async getActiveContext(opts = {}) {
    const { currentFile, userPrompt, manualIncludes = [] } = opts;
    const files = await this.listSteering();
    if (files.length === 0) return '';

    const included = [];

    for (const f of files) {
      let include = false;

      if (f.inclusion === 'always') {
        include = true;
      } else if (f.inclusion === 'conditional' && currentFile) {
        const patterns = Array.isArray(f.filePatterns)
          ? f.filePatterns
          : [f.filePatterns];
        include = patterns.some(p => {
          if (!p) return false;
          if (p.includes('*')) {
            const ext = p.replace('*', '');
            return currentFile.endsWith(ext);
          }
          return currentFile.includes(p);
        });
      } else if (f.inclusion === 'manual') {
        include =
          manualIncludes.includes(f.filename) ||
          manualIncludes.includes(f.name);
      } else if (f.inclusion === 'auto' && userPrompt) {
        // Heuristic: include if keywords from filename appear in the prompt
        const keywords = f.name.replace(/-/g, ' ').toLowerCase().split(' ');
        include = keywords.some(kw => userPrompt.toLowerCase().includes(kw));
      }

      if (include) {
        const full = await this.getSteering(f.filename);
        included.push(`### Steering: ${f.name}\n${full.content}`);
      }
    }

    if (included.length === 0) return '';

    return `## Workspace Steering Context\n\n${included.join('\n\n---\n\n')}`;
  }

  /**
   * Initialize a set of default steering files for a new workspace.
   */
  async initDefaults() {
    const defaults = [
      {
        name: 'code-standards',
        content: `# Code Standards\n\n- Use ESM modules (import/export syntax)\n- Async/await everywhere\n- Document all exported functions with JSDoc\n- Use named exports; avoid default exports except for React components\n- Prefix class-level private methods with underscore: \`_methodName\`\n`,
        options: { scope: 'workspace', inclusion: 'always' },
      },
      {
        name: 'tech-stack',
        content: `# Technology Stack\n\n- **Backend**: Node.js 20+, Express 4, Postgres, Redis\n- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS\n- **AI**: Gemini 1.5 Pro (primary), Claude (secondary via litellm)\n- **Infrastructure**: Docker, Terraform, GCP\n`,
        options: { scope: 'workspace', inclusion: 'always' },
      },
      {
        name: 'testing',
        content: `# Testing Standards\n\n- Use Jest for unit and integration tests\n- Test file naming: \`*.test.js\` in same directory as source\n- Always mock external I/O in unit tests\n- Aim for >80% coverage on service layer\n`,
        options: {
          scope: 'workspace',
          inclusion: 'conditional',
          filePatterns: ['*.test.js', '*.spec.ts'],
        },
      },
    ];

    const existing = await this.listSteering();
    const existingNames = existing.map(f => f.name);

    for (const d of defaults) {
      if (!existingNames.includes(d.name)) {
        await this.createSteering(d.name, d.content, d.options);
      }
    }

    logger.info('🧭 Steering: initialized default workspace steering files.');
  }
}

export const steeringService = new SteeringService();
