import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'alti_db',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
};

const optimize = async () => {
    console.log('🐘 Connecting to PostgreSQL...');
    const pool = new Pool(config);

    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Connected.');

        console.log('🚀 Optimizing Database...');

        // 1. Memories Table - Metadata Index (GIN for JSONB)
        console.log('   - Create GIN index on memories(metadata)...');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_memories_metadata ON memories USING GIN (metadata);');
        console.log('     ✅ Index `idx_memories_metadata` verified.');

        // 2. Memories Table - Vector Index (IVFFlat)
        // This is usually done in initSchema, but good to reinforce or tune lists.
        console.log('   - checking vector index on memories(embedding)...');
        // Note: Creating IVFFlat requires data to be accurate, but IF NOT EXISTS is safe.
        // We use vector_cosine_ops for cosine similarity.
        await pool.query('CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);');
        console.log('     ✅ Index `idx_memories_embedding` verified.');

        // 3. Agents Table (If exists)
        // Check if table exists first
        const res = await pool.query("SELECT to_regclass('public.agents');");
        if (res.rows[0].to_regclass) {
            console.log('   - Create GIN index on agents(capabilities)...');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_agents_capabilities ON agents USING GIN (capabilities);');
            console.log('     ✅ Index `idx_agents_capabilities` verified.');
        } else {
            console.log('   - Table `agents` does not exist (Skipping). Registry is likely Redis-only.');
        }

        console.log('✨ Optimization Complete!');

    } catch (error) {
        console.error('❌ Optimization Failed:', error);
    } finally {
        await pool.end();
    }
};

optimize();
