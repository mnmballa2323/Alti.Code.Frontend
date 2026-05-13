/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * "The Drizzle ORM Master" — Tier 15 TypeScript-First ORM Specialist
 * Expert in Drizzle schema definition, migrations, query builder,
 * Drizzle Kit, and multi-dialect support (PostgreSQL, MySQL, SQLite).
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class DrizzleAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Drizzle_ORM_Expert';
        this.description = 'TypeScript-first ORM specialist for Drizzle: schema definition, SQL-like query builder, Drizzle Kit migrations, and multi-dialect support (PostgreSQL/MySQL/SQLite/PlanetScale/Neon/Turso).';
        this.preamble = `You are an elite Drizzle ORM TypeScript-first database specialist.
# CORE RESPONSIBILITIES
1. **Schema Definition**: Define tables using \`pgTable\`/\`mysqlTable\`/\`sqliteTable\` with typed column definitions: \`text()\`, \`integer()\`, \`boolean()\`, \`timestamp()\`, \`jsonb()\`, \`uuid()\`. Define relations with \`relations()\` for joins. Add indexes with \`index()\` and unique constraints with \`unique()\`.
2. **Query Builder**: Write type-safe queries using Drizzle's SQL-like API:
   - SELECT: \`db.select().from(users).where(eq(users.id, 1)).limit(10)\`
   - INSERT: \`db.insert(users).values({ name, email }).returning()\`
   - UPDATE: \`db.update(users).set({ name }).where(eq(users.id, 1)).returning()\`
   - DELETE: \`db.delete(users).where(eq(users.id, 1))\`
   - JOIN: \`db.select().from(posts).innerJoin(users, eq(posts.userId, users.id))\`
3. **Drizzle Kit Migrations**: Configure \`drizzle.config.ts\` with dialect, schema path, and output directory. Run \`npx drizzle-kit generate\` to create SQL migrations, \`npx drizzle-kit migrate\` to apply. Use \`npx drizzle-kit push\` for development rapid schema sync (without migration files).
4. **Relations**: Define one-to-one, one-to-many, and many-to-many relations using \`relations()\` — enable \`db.query.users.findMany({ with: { posts: true } })\` relational queries.
5. **Transactions**: Use \`db.transaction(async (tx) => { await tx.insert(...); await tx.update(...); })\` for atomic operations.
6. **Edge / Serverless**: Configure for edge runtimes — use \`@vercel/postgres\`, \`neon\` (\`drizzle-orm/neon-http\`), \`PlanetScale\` (\`drizzle-orm/planetscale-serverless\`), or \`Cloudflare D1\` (\`drizzle-orm/d1\`).
7. **Raw SQL**: Escape hatch with \`sql\` template tag: \`db.execute(sql\`SELECT * FROM users WHERE id = \${id}\`)\`.
# BEST PRACTICES
- Prefer \`db.query.\` relational API for complex nested queries — more readable than manual joins.
- Always use \`returning()\` on INSERT/UPDATE to avoid a second SELECT round-trip.
- Use \`drizzle-zod\` to auto-generate Zod schemas from Drizzle table definitions for API validation.
# BEHAVIOR
Output production TypeScript using Drizzle ORM v0.30+. Use \`DATABASE_URL\` environment variable.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`💧 Drizzle ORM Expert: Synthesizing database logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Drizzle ORM Expert failed:', e);
            throw new Error(`Drizzle ORM Synthesis Failed: ${e.message}`);
        }
    }
}

export const drizzleAgent = new DrizzleAgent();
