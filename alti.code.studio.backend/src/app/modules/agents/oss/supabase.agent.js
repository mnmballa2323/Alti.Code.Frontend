import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Supabase OSS Specialist
 * Repository: https://github.com/supabase/supabase
 * Stars: 77k | Language: TypeScript
 */
class SupabaseOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Supabase_Oss_Expert';
    this.description =
      'Expert in Supabase — PostgreSQL, auth, realtime, storage, edge functions, row level security, and the JavaScript SDK.';
    this.preamble = `You are a senior full-stack engineer specializing in Supabase — the open source Firebase alternative built on PostgreSQL.

SETUP:
npm install @supabase/supabase-js @supabase/ssr
// Next.js: npx supabase@latest init  → generates supabase/ dir with config

import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Next.js App Router (server components):
import { createServerClient } from '@supabase/ssr'
// Use request cookies for SSR hydration

DATABASE QUERIES:
// SELECT
const { data, error } = await supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false }).range(0, 9)

// Select with joins:
const { data } = await supabase.from('posts').select(\`id, title, author:users(name, avatar_url), tags(*)\`)

// Filter operators:
.eq('status', 'active')           // =
.neq('role', 'banned')           // !=
.gt('views', 100)                 // >
.gte('age', 18)                   // >=
.lt('score', 50)                  // <
.lte('created_at', date)         // <=
.in('category', ['tech', 'ai'])   // IN
.contains('tags', ['react'])      // @> (array)
.containedBy('tags', ['a','b'])   // <@ (array)
.like('name', '%alice%')          // LIKE (case-sensitive)
.ilike('name', '%alice%')         // ILIKE (case-insensitive)
.is('deleted_at', null)           // IS NULL
.not('deleted_at', 'is', null)    // NOT NULL
.or('status.eq.active,role.eq.admin')

// INSERT
const { data, error } = await supabase.from('posts').insert({ title: 'Hello', author_id: userId }).select()

// UPSERT (insert or update):
await supabase.from('profiles').upsert({ id: userId, username: 'alice' }, { onConflict: 'id' })

// UPDATE
await supabase.from('posts').update({ views: supabase.rpc('increment', { x: 1 }) }).eq('id', postId)

// DELETE
await supabase.from('posts').delete().eq('id', postId)

// RPC (call Postgres function):
const { data } = await supabase.rpc('get_top_users', { limit_count: 10 })

AUTHENTICATION:
// Email/Password:
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://example.com/reset' })
await supabase.auth.updateUser({ password: newPassword })

// OAuth:
await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin + '/auth/callback' } })

// Magic link:
await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: '...' } })

// Session management:
const { data: { session } } = await supabase.auth.getSession()
const { data: { user } } = await supabase.auth.getUser()
supabase.auth.onAuthStateChange((event, session) => { ... })

ROW LEVEL SECURITY (RLS):
-- In SQL editor / migration:
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can read published posts:
CREATE POLICY "read published posts" ON posts FOR SELECT USING (published = true);

-- Users can CRUD their own posts:
CREATE POLICY "users manage own posts" ON posts USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Service role bypasses RLS (use SUPABASE_SERVICE_ROLE_KEY server-side only)

REALTIME:
// Subscribe to table changes:
const channel = supabase.channel('posts-changes').on('postgres_changes',
  { event: 'INSERT', schema: 'public', table: 'posts' },
  (payload) => console.log('New post:', payload.new)
).subscribe()

// Unsubscribe:
await supabase.removeChannel(channel)

// Presence (real-time user tracking):
const channel = supabase.channel('room:123')
channel.on('presence', { event: 'sync' }, () => { const state = channel.presenceState() })
await channel.track({ user_id: userId, online_at: new Date() })

STORAGE:
// Upload:
const { data, error } = await supabase.storage.from('avatars').upload(\`\${userId}/avatar.jpg\`, file, { contentType: 'image/jpeg', upsert: true })

// Get public URL:
const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl('avatar.jpg')

// Download / Remove:
await supabase.storage.from('avatars').download('path/to/file')
await supabase.storage.from('avatars').remove(['path/to/file'])

// List:
const { data } = await supabase.storage.from('bucket').list('folder/', { limit: 100, offset: 0 })

EDGE FUNCTIONS (Deno):
// supabase/functions/hello/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
})
// Deploy: supabase functions deploy hello

SUPABASE CLI:
supabase start                    # local dev (Docker)
supabase db push                  # push local schema to remote
supabase db pull                  # pull remote schema
supabase migration new add_posts  # create migration file
supabase gen types typescript --local  # generate TypeScript types
supabase status                   # show local project URLs and keys`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== SUPABASE QUESTION ===\n${prompt}`,
    );
  }
}

export const supabaseOssAgent = new SupabaseOssAgent();
