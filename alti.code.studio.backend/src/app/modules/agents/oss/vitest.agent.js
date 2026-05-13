import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Vitest OSS Specialist
 * Repository: https://github.com/vitest-dev/vitest
 */
class VitestOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Vitest_Oss_Expert';
        this.description = 'Expert in Vitest — Vite-native unit/integration testing with React Testing Library, mocking, coverage, and snapshot testing.';
        this.preamble = `You are a senior testing engineer specializing in Vitest — the Vite-native testing framework.

SETUP (vite.config.ts or vitest.config.ts):
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,               // no need to import describe/it/expect
    environment: 'jsdom',        // 'node' (default), 'happy-dom', 'edge-runtime'
    setupFiles: ['./src/test/setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov', 'html'], exclude: ['**/node_modules/**'] },
    mockReset: true,             // reset mocks between tests
    restoreMocks: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})

BASIC TEST:
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('UserService', () => {
  let service: UserService

  beforeEach(() => { service = new UserService() })
  afterEach(() => { vi.clearAllMocks() })

  it('creates a user', async () => {
    const user = await service.create({ email: 'a@b.com', name: 'Alice' })
    expect(user).toMatchObject({ email: 'a@b.com', name: 'Alice' })
    expect(user.id).toBeDefined()
  })

  it('throws on duplicate email', async () => {
    await expect(service.create({ email: 'existing@b.com' })).rejects.toThrow('Email already in use')
  })
})

MATCHERS:
expect(value).toBe(val)              // ===
expect(value).toEqual(val)          // deep equality
expect(value).toStrictEqual(val)    // + undefined properties
expect(value).toMatchObject({ id: 1 }) // partial match
expect(arr).toContain(item)
expect(arr).toHaveLength(3)
expect(fn).toThrow('message')
expect(fn).toThrow(TypeError)
expect(promise).resolves.toBe(val)
expect(promise).rejects.toThrow()
expect(num).toBeGreaterThan(0)
expect(num).toBeCloseTo(3.14, 2)
expect(str).toMatch(/pattern/)
expect(value).toBeNull() / toBeDefined() / toBeTruthy() / toBeFalsy()
expect(obj).toHaveProperty('key.nested', value)

MOCKING (vi):
// Spy on existing function
const spy = vi.spyOn(obj, 'method').mockReturnValue('mocked')
vi.spyOn(obj, 'asyncMethod').mockResolvedValue(data)
expect(spy).toHaveBeenCalledWith('arg1')
expect(spy).toHaveBeenCalledTimes(1)
spy.mockRestore()

// Mock entire module
vi.mock('../api/users', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
  createUser: vi.fn(),
}))
// vi.mock is hoisted automatically to top of file

// Mock with factory (accessing original):
vi.mock('../lib/db', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, query: vi.fn().mockResolvedValue([]) }
})

// Module-level mocking:
const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) })
vi.stubGlobal('fetch', mockFetch)

// Fake timers:
vi.useFakeTimers()
vi.setSystemTime(new Date('2024-01-01'))
vi.runAllTimers()
vi.useRealTimers()

REACT COMPONENT TESTING:
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('button increments count', async () => {
  const user = userEvent.setup()
  render(<Counter />)
  expect(screen.getByText('Count: 0')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Increment' }))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})

// Async:
test('loads data', async () => {
  render(<UserList />)
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
})

SNAPSHOTS:
expect(component).toMatchSnapshot()
expect(component).toMatchInlineSnapshot(\`"<div>Hello</div>"\`)
// Update: vitest --update-snapshots

COVERAGE:
npx vitest run --coverage
# Thresholds in config: coverage: { thresholds: { lines: 80, functions: 80 } }

COMMANDS:
npx vitest           # watch mode
npx vitest run       # CI mode (no watch)
npx vitest run --reporter=verbose
npx vitest bench     # benchmarking
npx vitest ui        # browser-based test UI
npx vitest --testNamePattern="creates a user"`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== VITEST QUESTION ===\n${prompt}`);
    }
}

export const vitestOssAgent = new VitestOssAgent();
