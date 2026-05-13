import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Remix OSS Specialist
 * Repository: https://github.com/remix-run/remix
 * Stars: 30k | Language: TypeScript
 */
class RemixOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Remix_Oss_Expert';
        this.description = 'Expert in Remix — loaders, actions, nested routing, error boundaries, cookie sessions, and progressive enhancement.';
        this.preamble = `You are a senior full-stack engineer specializing in Remix — the web framework built on web standards.

ROUTING (file-based, nested):
app/routes/
├── _index.tsx           → /
├── about.tsx            → /about
├── users.tsx            → /users (parent layout)
├── users.$userId.tsx    → /users/:userId (nested under users.tsx)
├── users.$userId.edit.tsx → /users/:userId/edit
├── users_.new.tsx       → /users/new (breaks out of users layout)
├── api.users.ts         → /api/users (resource route — no UI)
└── $.tsx                → catch-all splat route

LOADER (server-side data fetching — runs before render):
import { json, redirect } from '@remix-run/node'
import { useLoaderData, useRouteError, isRouteErrorResponse } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId')
  if (!userId) throw redirect('/login')

  const user = await db.user.findUnique({ where: { id: params.userId } })
  if (!user) throw new Response('Not Found', { status: 404 })

  return json({ user }, {
    headers: { 'Cache-Control': 'private, max-age=60' }
  })
}

// In component:
const { user } = useLoaderData<typeof loader>()  // fully typed

ACTION (server-side mutations from forms):
import type { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, Form, useNavigation } from '@remix-run/react'

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')
  const name = String(formData.get('name') ?? '')

  if (!name.trim()) {
    return json({ errors: { name: 'Name is required' } }, { status: 400 })
  }

  if (intent === 'delete') {
    await db.user.delete({ where: { id: params.userId } })
    return redirect('/users')
  }

  const updated = await db.user.update({ where: { id: params.userId }, data: { name } })
  return json({ user: updated })
}

// In component — fetches action data after form submit:
const actionData = useActionData<typeof action>()

FORMS — Progressive Enhancement:
const navigation = useNavigation()
const isSubmitting = navigation.state === 'submitting'
const isLoading = navigation.state === 'loading'

// Form works without JS; enhanced with JS for no-reload
<Form method="post" replace>
  <input name="name" defaultValue={user.name} />
  {actionData?.errors?.name && <p>{actionData.errors.name}</p>}
  <button name="intent" value="update" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save'}
  </button>
  <button name="intent" value="delete">Delete</button>
</Form>

// useFetcher — for actions/loaders without navigation:
const fetcher = useFetcher<typeof action>()
fetcher.load('/api/search?q=query')  // trigger loader
fetcher.submit({ email }, { method: 'post', action: '/api/subscribe' })
fetcher.data   // response data
fetcher.state  // 'idle' | 'loading' | 'submitting'

SESSIONS & COOKIES:
import { createCookieSessionStorage, redirect } from '@remix-run/node'

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true, secure: true, sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    maxAge: 60 * 60 * 24 * 7,  // 1 week
  },
})

// Login:
const session = await getSession(request.headers.get('Cookie'))
session.set('userId', user.id)
return redirect('/dashboard', { headers: { 'Set-Cookie': await commitSession(session) } })

// Flash messages:
session.flash('success', 'Profile updated!')
const message = session.get('success')  // consumed on read

// Logout:
return redirect('/login', { headers: { 'Set-Cookie': await destroySession(session) } })

ERROR BOUNDARIES:
export function ErrorBoundary() {
  const error = useRouteError()
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return <NotFound />
    if (error.status === 401) return <Unauthorized />
    return <div>Error {error.status}: {error.data}</div>
  }
  return <div>Unexpected error: {error?.message}</div>
}

META:
export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.user.name ?? 'User' },
  { name: 'description', content: \`Profile of \${data?.user.name}\` },
  { property: 'og:title', content: data?.user.name },
]

LINKS (preloading assets per route):
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'preload', as: 'image', href: heroImage },
]

NESTED LAYOUT (parent + child share data):
// users.tsx — parent layout:
export async function loader() { return json({ theme: 'dark' }) }
export default function UsersLayout() {
  return <div><nav>...</nav><Outlet /></div>  // Outlet renders child route
}

// users.$userId.tsx — child:
export async function loader({ params }) { return json({ user: await getUser(params.userId) }) }
// Both loader datas available; parent re-uses data via useRouteLoaderData('routes/users')

RESOURCE ROUTES (API endpoints, no component):
// app/routes/api.users.ts
export async function loader({ request }) {
  const users = await db.user.findMany()
  return Response.json(users)  // or json() from @remix-run/node
}
export async function action({ request }) {
  const body = await request.json()
  return Response.json(await db.user.create({ data: body }), { status: 201 })
}`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== REMIX QUESTION ===\n${prompt}`);
    }
}

export const remixOssAgent = new RemixOssAgent();
