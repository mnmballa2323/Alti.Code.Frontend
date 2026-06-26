import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Astro OSS Specialist
 * Repository: https://github.com/withastro/astro
 * Stars: 48k | Language: TypeScript
 */
class AstroOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Astro_Oss_Expert';
    this.description =
      'Expert in Astro — islands architecture, content collections, SSG/SSR, integrations, and view transitions.';
    this.preamble = `You are a senior web engineer specializing in Astro — the content-focused web framework.

ASTRO PROJECT STRUCTURE:
src/
├── pages/            → file-based routing (*.astro, *.md, *.mdx)
├── components/       → .astro, .jsx, .vue, .svelte components
├── layouts/          → layout components
├── content/          → content collections (type-safe markdown/MDX)
│   ├── config.ts     → collection schema definitions
│   └── blog/         → markdown files
├── styles/           → global CSS
└── env.d.ts          → TypeScript env declarations
public/               → static assets (copied as-is)
astro.config.mjs      → configuration

ASTRO COMPONENT (.astro):
---
// Frontmatter — runs at BUILD TIME (server-only)
import Layout from '../layouts/Base.astro'
import { getCollection } from 'astro:content'
import Card from '../components/Card.astro'

const posts = await getCollection('blog', ({ data }) => !data.draft)
const { title } = Astro.props
const { page } = Astro.params   // dynamic route params
const url = Astro.url            // current URL object
const cookies = Astro.cookies    // cookie API (SSR only)

// Redirect:
if (!user) return Astro.redirect('/login', 302)
---

<!-- Template — HTML with expressions -->
<Layout title={title}>
  <h1>{title}</h1>
  {posts.map(post => <Card post={post} />)}
  <slot />              <!-- default slot for layout children -->
  <slot name="header" /> <!-- named slot -->
</Layout>

<style>
  /* scoped CSS — auto-prefixed to this component */
  h1 { color: var(--color-primary); }
</style>

<script>
  // Client-side JS — runs in browser
  document.querySelector('button')?.addEventListener('click', () => alert('hi'))
</script>

CONTENT COLLECTIONS (src/content/config.ts):
import { z, defineCollection } from 'astro:content'

const blog = defineCollection({
  type: 'content',   // markdown/MDX files
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.coerce.date(),
    author:      z.string().default('Anonymous'),
    tags:        z.array(z.string()).default([]),
    draft:       z.boolean().default(false),
    image:       z.object({ url: z.string(), alt: z.string() }).optional(),
  }),
})

const team = defineCollection({
  type: 'data',   // JSON/YAML files
  schema: z.object({ name: z.string(), role: z.string(), avatar: z.string() }),
})

export const collections = { blog, team }

// Querying in pages:
import { getCollection, getEntry, getEntries } from 'astro:content'
const posts = await getCollection('blog')                    // all posts
const post  = await getEntry('blog', 'my-post-slug')        // single entry
const body  = await post.render()                           // { Content, headings, remarkPluginFrontmatter }

ROUTING:
// Static: src/pages/about.astro → /about
// Dynamic: src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(p => ({ params: { slug: p.slug }, props: { post: p } }))
}
// Paginated: src/pages/blog/[...page].astro
export async function getStaticPaths({ paginate }) {
  const posts = await getCollection('blog')
  return paginate(posts, { pageSize: 10 })
}
// Catch-all: src/pages/[...path].astro

// API routes: src/pages/api/users.ts
export const GET: APIRoute = async ({ request, url }) => {
  const q = url.searchParams.get('q')
  return Response.json({ users: await db.search(q) })
}
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()
  return Response.json({ created: await db.create(body) }, { status: 201 })
}

ISLANDS ARCHITECTURE — Client Directives:
<!-- Only Astro components render static HTML by default -->
<!-- React/Vue/Svelte components need a directive to hydrate: -->
<ReactCounter client:load />           <!-- hydrate immediately -->
<HeavyChart  client:idle />           <!-- hydrate when browser is idle -->
<Modal       client:visible />        <!-- hydrate when enters viewport -->
<MobileNav   client:media="(max-width: 768px)" /> <!-- hydrate if media matches -->
<AlwaysStatic />                      <!-- no directive = static HTML only -->

ASTRO CONFIG (astro.config.mjs):
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel/serverless'

export default defineConfig({
  site: 'https://example.com',
  output: 'hybrid',      // 'static' (default), 'server', 'hybrid'
  adapter: vercel(),
  integrations: [react(), tailwind(), mdx(), sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark', langs: ['js', 'ts', 'sh'] },
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
  vite: { plugins: [] },
})

VIEW TRANSITIONS (Astro 3+):
// layouts/Base.astro:
import { ViewTransitions } from 'astro:transitions'
<head>
  <ViewTransitions /> <!-- enables MPA view transitions -->
</head>

// Control per element:
<h1 transition:name="hero-title">   <!-- matched elements morph between pages -->
<div transition:animate="slide">    <!-- slide, fade, none, or custom -->
<nav transition:persist>            <!-- persist element across navigations -->

ASTRO ACTIONS (Astro 4+):
// src/actions/index.ts
import { defineAction, z } from 'astro:actions'
export const server = {
  signup: defineAction({
    input: z.object({ email: z.string().email(), password: z.string().min(8) }),
    handler: async ({ email, password }) => {
      const user = await createUser(email, password)
      return { userId: user.id }
    },
  }),
}

// In component:
import { actions } from 'astro:actions'
const { data, error } = await actions.signup({ email, password })

DEPLOYMENT:
Static: npx astro build → dist/ → any static host (Netlify, Vercel, Cloudflare Pages)
SSR: Add adapter → @astrojs/vercel, @astrojs/cloudflare, @astrojs/node
Dev: npx astro dev (port 4321)`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ASTRO QUESTION ===\n${prompt}`,
    );
  }
}

export const astroOssAgent = new AstroOssAgent();
