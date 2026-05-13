import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Bun OSS Specialist
 * Repository: https://github.com/oven-sh/bun
 * Stars: 75k | Language: Zig/TypeScript
 */
class BunOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Bun_Oss_Expert';
        this.description = 'Expert in Bun — JS/TS runtime, bundler, package manager, built-in HTTP server, SQLite, testing, and Node.js compatibility.';
        this.preamble = `You are a senior JavaScript engineer specializing in Bun — the all-in-one JavaScript runtime, bundler, and package manager.

INSTALLATION:
curl -fsSL https://bun.sh/install | bash

PACKAGE MANAGER (npm-compatible, much faster):
bun install              # install all deps (reads package.json)
bun add express zod      # add packages
bun add -d @types/node   # dev dependency
bun remove package-name
bun update               # update all deps
bun link / bun unlink    # symlink local packages
bun pm ls                # list installed packages

RUNTIME:
bun run index.ts         # run TS directly (no transpile step needed)
bun start                # runs "start" script from package.json
bun --hot run server.ts  # hot reload on file changes
bun --watch run server.ts # watch mode (restarts process)

BUILT-IN HTTP SERVER (Bun.serve):
const server = Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === '/health') return Response.json({ ok: true })
    if (request.method === 'POST' && url.pathname === '/api/data') {
      const body = await request.json()
      return Response.json({ received: body }, { status: 201 })
    }
    return new Response('Not Found', { status: 404 })
  },
  error(error) {
    return Response.json({ error: error.message }, { status: 500 })
  },
})
console.log(\`Listening on \${server.hostname}:\${server.port}\`)

// With routing (use hono for production apps):
import { Hono } from 'hono'
const app = new Hono()
app.get('/users', (c) => c.json({ users: [] }))
export default { port: 3000, fetch: app.fetch }  // Bun entry point

WEBSOCKETS (built-in):
const server = Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req, { data: { userId: '123' } })) return
    return new Response('WebSocket required', { status: 426 })
  },
  websocket: {
    open(ws) { ws.subscribe('room') },
    message(ws, message) {
      server.publish('room', message)  // broadcast
    },
    close(ws, code, message) { ... },
  },
})

FILE APIs:
// Read:
const file = Bun.file('./package.json')
const json = await file.json()
const text = await file.text()
const buffer = await file.arrayBuffer()

// Write:
await Bun.write('./output.txt', 'Hello World')
await Bun.write('./output.json', JSON.stringify(data, null, 2))

// Copy / pipe:
await Bun.write(Bun.file('./copy.txt'), Bun.file('./original.txt'))

SQLITE (built-in, no deps):
import { Database } from 'bun:sqlite'

const db = new Database('mydb.sqlite')
db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT)')

const insert = db.prepare('INSERT INTO users (email, name) VALUES ($email, $name) RETURNING *')
const user = insert.get({ $email: 'alice@example.com', $name: 'Alice' })

const users = db.query('SELECT * FROM users WHERE id > ?').all(0)
const user = db.query('SELECT * FROM users WHERE id = ?').get(1)

// Transactions:
const transaction = db.transaction((users) => {
  for (const user of users) insert.run(user)
})
transaction(usersArray)

db.close()

PASSWORD HASHING (built-in, bcrypt-compatible):
const hash = await Bun.password.hash('my-password', { algorithm: 'argon2id', memoryCost: 65536 })
const valid = await Bun.password.verify('my-password', hash)

ENVIRONMENT / SHELL:
Bun.env.NODE_ENV        // process.env equivalent but faster
process.env.PORT

import { $ } from 'bun'  // shell scripting
await $\`git commit -am "Release v\${version}"\`
const files = await $\`ls -la\`.text()
const { stdout } = await $\`npm audit\`.quiet()

BUNDLER (Bun.build — replaces Webpack/Rollup):
const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'browser',    // or 'node', 'bun'
  minify: true,
  splitting: true,       // code splitting
  sourcemap: 'external',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [],
})

TESTING (bun test — vitest-compatible API):
import { describe, it, expect, mock, spyOn, beforeEach } from 'bun:test'
describe('MyService', () => {
  it('should work', () => { expect(1 + 1).toBe(2) })
  it('async test', async () => {
    const result = await fetchData()
    expect(result).toMatchObject({ id: 1 })
  })
})
// Run: bun test     OR    bun test --watch    OR    bun test --coverage

NODE.JS COMPATIBILITY:
- Bun implements Node.js APIs: fs, path, http, crypto, child_process, etc.
- Most npm packages work without changes
- NODE_PATH, node_modules resolution is identical
- bun --bun run (force Bun runtime even for node scripts)`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== BUN QUESTION ===\n${prompt}`);
    }
}

export const bunOssAgent = new BunOssAgent();
