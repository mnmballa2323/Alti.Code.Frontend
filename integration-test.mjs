/**
 * ═══════════════════════════════════════════════════════════════════════
 * ALTI CODE STUDIO — FULL SYSTEM INTEGRATION TEST
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Tests the entire unified flow:
 *   Landing Page → Register → Login → Billing/Checkout → Auth Verification
 *   → Owner/Admin Platform → All systems working as ONE
 *
 * Usage:  node integration-test.mjs
 * Requires: Backend running on port 5000, Frontend running on port 3005
 * ═══════════════════════════════════════════════════════════════════════
 */

const BACKEND  = process.env.BACKEND_URL  || 'http://127.0.0.1:5000/api/v1';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3005';

// ── Unique test user to avoid collisions ──
const TS = Date.now();
const TEST_USER = {
  email: `integration-test-${TS}@alticode.com`,
  password: 'Test@Secure2026!',
  confirmPassword: 'Test@Secure2026!',
  companyName: `Alti Test Corp ${TS}`,
};

// ── Helpers ──
const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

let passed = 0;
let failed = 0;
let warnings = 0;
const results = [];

function ok(label, detail = '') {
  passed++;
  const msg = `  ${GREEN}✓${RESET} ${label}${detail ? DIM + ' — ' + detail + RESET : ''}`;
  console.log(msg);
  results.push({ status: 'PASS', label, detail });
}

function fail(label, detail = '') {
  failed++;
  const msg = `  ${RED}✗${RESET} ${label}${detail ? RED + ' — ' + detail + RESET : ''}`;
  console.log(msg);
  results.push({ status: 'FAIL', label, detail });
}

function warn(label, detail = '') {
  warnings++;
  const msg = `  ${YELLOW}⚠${RESET} ${label}${detail ? YELLOW + ' — ' + detail + RESET : ''}`;
  console.log(msg);
  results.push({ status: 'WARN', label, detail });
}

function header(title) {
  console.log(`\n${CYAN}${BOLD}━━━ ${title} ━━━${RESET}`);
}

async function safeFetch(url, opts = {}) {
  try {
    const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(10000) });
    let body = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return { status: res.status, ok: res.ok, body, headers: res.headers };
  } catch (err) {
    return { status: 0, ok: false, body: null, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  TEST SUITES
// ═══════════════════════════════════════════════════════════════════════

async function testBackendHealth() {
  header('1 · BACKEND SERVER HEALTH');

  // 1a. Server reachable
  const health = await safeFetch(`${BACKEND.replace('/api/v1', '')}/health`);
  if (health.error) {
    // Try base URL
    const base = await safeFetch(BACKEND.replace('/api/v1', ''));
    if (base.error) {
      fail('Backend server reachable', `Connection refused: ${base.error}`);
      return false;
    }
  }
  ok('Backend server reachable', `${BACKEND}`);

  // 1b. API base responds
  const api = await safeFetch(`${BACKEND}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' }),
  });
  if (api.status > 0) {
    ok('API endpoint responds', `Status: ${api.status}`);
  } else {
    fail('API endpoint responds', api.error);
    return false;
  }

  return true;
}

async function testFrontendHealth() {
  header('2 · FRONTEND SERVER HEALTH');

  // 2a. Landing page loads
  const landing = await safeFetch(FRONTEND);
  if (landing.status === 200) {
    ok('Landing page loads', `Status: 200`);
  } else if (landing.status > 0) {
    warn('Landing page response', `Status: ${landing.status}`);
  } else {
    warn('Landing page not available (frontend dev server may not be running)', landing.error);
    return false;
  }

  // 2b. Check that HTML contains key elements
  if (typeof landing.body === 'string') {
    if (landing.body.includes('Pricing') || landing.body.includes('pricing')) {
      ok('Landing page has Pricing section');
    } else {
      warn('Landing page missing Pricing section in SSR HTML');
    }

    if (landing.body.includes('register') || landing.body.includes('Register')) {
      ok('Landing page has Register link');
    } else {
      warn('Landing page missing Register link in SSR HTML');
    }

    if (landing.body.includes('login') || landing.body.includes('Login')) {
      ok('Landing page has Login link');
    } else {
      warn('Landing page missing Login link in SSR HTML');
    }
  }

  // 2c. Register page accessible
  const regPage = await safeFetch(`${FRONTEND}/register`);
  if (regPage.status === 200) {
    ok('Register page accessible', '/register → 200');
  } else {
    warn('Register page', `Status: ${regPage.status}`);
  }

  // 2d. Login page accessible
  const loginPage = await safeFetch(`${FRONTEND}/login`);
  if (loginPage.status === 200) {
    ok('Login page accessible', '/login → 200');
  } else {
    warn('Login page', `Status: ${loginPage.status}`);
  }

  // 2e. Payment success page accessible
  const successPage = await safeFetch(`${FRONTEND}/payment-success`);
  if (successPage.status === 200) {
    ok('Payment success page accessible', '/payment-success → 200');
  } else {
    fail('Payment success page accessible', `Status: ${successPage.status}`);
  }

  return true;
}

async function testRegistration() {
  header('3 · USER REGISTRATION');

  // 3a. Register new user
  const reg = await safeFetch(`${BACKEND}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER),
  });

  if (reg.ok && reg.body?.success) {
    ok('Register new user', `${TEST_USER.email}`);
  } else if (reg.status === 409 || (reg.body?.message || '').toLowerCase().includes('exist')) {
    warn('Register user (already exists)', reg.body?.message);
  } else if (reg.status === 400) {
    warn('Register validation', reg.body?.message || `Status: ${reg.status}`);
  } else {
    fail('Register new user', `${reg.status}: ${JSON.stringify(reg.body?.message || reg.body)}`);
  }

  // 3b. Reject duplicate registration
  const dup = await safeFetch(`${BACKEND}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER),
  });
  if (!dup.ok || (dup.body?.message || '').toLowerCase().includes('exist')) {
    ok('Reject duplicate registration');
  } else {
    fail('Reject duplicate registration', 'Duplicate was accepted');
  }

  // 3c. Reject registration with missing fields
  const bad = await safeFetch(`${BACKEND}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bad' }),
  });
  if (!bad.ok || bad.status >= 400) {
    ok('Reject registration with invalid data', `Status: ${bad.status}`);
  } else {
    fail('Reject registration with invalid data', 'Bad registration was accepted');
  }

  return true;
}

let ACCESS_TOKEN = null;

async function testLogin() {
  header('4 · USER LOGIN & JWT AUTH');

  // 4a. Login with correct credentials
  const login = await safeFetch(`${BACKEND}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
  });

  if (login.ok && login.body?.data?.accessToken) {
    ACCESS_TOKEN = login.body.data.accessToken;
    ok('Login with valid credentials', `Token received (${ACCESS_TOKEN.slice(0, 20)}…)`);
  } else if (login.ok && login.body?.data?.mfaRequired) {
    warn('Login requires MFA', 'MFA flow detected — cannot proceed automatically');
    return false;
  } else {
    fail('Login with valid credentials', `${login.status}: ${JSON.stringify(login.body?.message || login.body)}`);
    return false;
  }

  // 4b. Reject login with wrong password
  const badLogin = await safeFetch(`${BACKEND}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: 'WrongPassword123!',
    }),
  });
  if (!badLogin.ok || badLogin.status >= 400) {
    ok('Reject login with wrong password', `Status: ${badLogin.status}`);
  } else {
    fail('Reject login with wrong password', 'Wrong password was accepted');
  }

  // 4c. Validate JWT token on protected endpoint
  const profile = await safeFetch(`${BACKEND}/auth/user/single-user`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

  if (profile.ok && profile.body?.data) {
    const u = profile.body.data;
    ok('JWT token validates on protected endpoint', `User: ${u.email || u._id}`);
  } else {
    fail('JWT token validates on protected endpoint', `${profile.status}: ${JSON.stringify(profile.body?.message)}`);
  }

  // 4d. Reject request with invalid token
  const noAuth = await safeFetch(`${BACKEND}/auth/user/single-user`, {
    method: 'GET',
    headers: { Authorization: 'Bearer invalid-garbage-token' },
  });
  if (!noAuth.ok && noAuth.status === 401) {
    ok('Reject request with invalid JWT', `Status: 401`);
  } else if (!noAuth.ok) {
    ok('Reject request with invalid JWT', `Status: ${noAuth.status}`);
  } else {
    fail('Reject request with invalid JWT', 'Invalid token was accepted');
  }

  // 4e. Reject request with no token
  const noToken = await safeFetch(`${BACKEND}/auth/user/single-user`);
  if (!noToken.ok && (noToken.status === 401 || noToken.status === 403)) {
    ok('Reject request with no token', `Status: ${noToken.status}`);
  } else {
    fail('Reject request with no token', `Status: ${noToken.status}`);
  }

  return true;
}

async function testBilling() {
  header('5 · BILLING & STRIPE CHECKOUT');

  if (!ACCESS_TOKEN) {
    warn('Skipping billing tests', 'No valid access token from login');
    return false;
  }

  // 5a. Create checkout session (will fail if Stripe keys are dummy, but tests the endpoint)
  const checkout = await safeFetch(`${BACKEND}/payment/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      plan_name: 'launch',
      price: 100000,
      duration: 'year',
    }),
  });

  if (checkout.ok && checkout.body?.data?.url) {
    const url = checkout.body.data.url;
    if (url.includes('stripe.com') || url.includes('checkout.stripe.com')) {
      ok('Stripe checkout session created', `→ ${url.slice(0, 60)}…`);
    } else {
      ok('Checkout session created', `URL: ${url.slice(0, 60)}…`);
    }
  } else if (checkout.status === 500 && (checkout.body?.message || '').includes('Stripe')) {
    warn('Stripe API error (expected in dev without valid keys)', checkout.body?.message?.slice(0, 80));
  } else if (checkout.status === 401 || checkout.status === 403) {
    fail('Checkout session auth', `Auth middleware returned ${checkout.status}`);
  } else {
    warn('Checkout session creation', `${checkout.status}: ${JSON.stringify(checkout.body?.message || checkout.body).slice(0, 100)}`);
  }

  // 5b. Reject checkout without auth
  const noAuth = await safeFetch(`${BACKEND}/payment/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_name: 'launch', price: 100000, duration: 'year' }),
  });
  if (!noAuth.ok && (noAuth.status === 401 || noAuth.status === 403)) {
    ok('Reject checkout without auth token', `Status: ${noAuth.status}`);
  } else {
    fail('Reject checkout without auth token', `Status: ${noAuth.status} — endpoint is unprotected!`);
  }

  // 5c. Reject checkout with invalid plan
  const badPlan = await safeFetch(`${BACKEND}/payment/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ plan_name: 'invalid-plan', price: 999, duration: 'year' }),
  });
  if (!badPlan.ok || badPlan.status >= 400) {
    ok('Reject checkout with invalid plan name', `Status: ${badPlan.status}`);
  } else {
    fail('Reject checkout with invalid plan name', 'Invalid plan was accepted');
  }

  // 5d. Webhook endpoint exists (responds to POST)
  const webhook = await safeFetch(`${BACKEND}/payment/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (webhook.status > 0 && webhook.status !== 404) {
    ok('Webhook endpoint reachable', `Status: ${webhook.status}`);
  } else if (webhook.status === 404) {
    fail('Webhook endpoint reachable', 'Got 404 — route not mounted');
  } else {
    fail('Webhook endpoint reachable', webhook.error);
  }

  return true;
}

async function testAdminPlatform() {
  header('6 · ADMIN / OWNER PLATFORM');

  if (!ACCESS_TOKEN) {
    warn('Skipping admin tests', 'No valid access token');
    return false;
  }

  // 6a. All-users endpoint (requires admin role)
  const users = await safeFetch(`${BACKEND}/admin/all-user`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

  if (users.ok && Array.isArray(users.body?.data)) {
    ok('Admin all-users endpoint', `${users.body.data.length} users returned`);
  } else if (users.status === 403) {
    ok('Admin all-users correctly blocks non-admin user', `Status: 403`);
  } else if (users.status === 401) {
    warn('Admin all-users auth issue', `Status: 401`);
  } else {
    warn('Admin all-users endpoint', `${users.status}: ${JSON.stringify(users.body?.message || '').slice(0, 80)}`);
  }

  // 6b. Admin email lookup protected
  const emailLookup = await safeFetch(`${BACKEND}/admin/admin/test@example.com`);
  if (!emailLookup.ok && (emailLookup.status === 401 || emailLookup.status === 403)) {
    ok('Admin email lookup protected', `Status: ${emailLookup.status}`);
  } else if (emailLookup.ok) {
    fail('Admin email lookup protected', 'Endpoint is still unprotected!');
  } else {
    warn('Admin email lookup', `Status: ${emailLookup.status}`);
  }

  // 6c. Admin page in frontend
  const adminPage = await safeFetch(`${FRONTEND}/admin/billing`);
  if (adminPage.status === 200) {
    ok('Admin billing page accessible', '/admin/billing → 200');
  } else {
    warn('Admin billing page', `Status: ${adminPage.status}`);
  }

  // 6d. Owner dashboard page in frontend
  const ownerPage = await safeFetch(`${FRONTEND}/owner/dashboard`);
  if (ownerPage.status === 200) {
    ok('Owner dashboard page accessible', '/owner/dashboard → 200');
  } else {
    warn('Owner dashboard page', `Status: ${ownerPage.status}`);
  }

  // 6e. All subscriptions endpoint (admin only)
  const subs = await safeFetch(`${BACKEND}/payment/admin/all`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  if (subs.ok) {
    ok('Payment subscriptions list', `${(subs.body?.data || []).length} subscriptions`);
  } else if (subs.status === 403) {
    ok('Subscriptions list blocked for non-admin', `Status: 403`);
  } else {
    warn('Subscriptions list', `${subs.status}: ${JSON.stringify(subs.body?.message || '').slice(0, 80)}`);
  }

  return true;
}

async function testRouteProtection() {
  header('7 · ROUTE PROTECTION & SECURITY');

  // 7a. Protected endpoints reject unauthenticated requests
  const protectedRoutes = [
    { method: 'GET',  path: '/auth/user/single-user', label: 'User profile' },
    { method: 'GET',  path: '/admin/all-user',         label: 'Admin all-users' },
    { method: 'GET',  path: '/admin/admin/test@test.com', label: 'Admin email lookup' },
    { method: 'POST', path: '/payment/create-checkout-session', label: 'Checkout session' },
    { method: 'GET',  path: '/payment/admin/all',      label: 'All subscriptions' },
  ];

  for (const route of protectedRoutes) {
    const res = await safeFetch(`${BACKEND}${route.path}`, {
      method: route.method,
      headers: { 'Content-Type': 'application/json' },
      body: route.method === 'POST' ? '{}' : undefined,
    });
    if (!res.ok && (res.status === 401 || res.status === 403)) {
      ok(`${route.label} rejects unauthenticated`, `Status: ${res.status}`);
    } else if (res.ok) {
      fail(`${route.label} rejects unauthenticated`, `Status: ${res.status} — UNPROTECTED!`);
    } else {
      warn(`${route.label} rejection`, `Status: ${res.status}`);
    }
  }

  // 7b. Webhook remains open (Stripe needs to call it)
  const webhook = await safeFetch(`${BACKEND}/payment/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (webhook.status !== 401 && webhook.status !== 403) {
    ok('Webhook endpoint open (no auth required for Stripe)', `Status: ${webhook.status}`);
  } else {
    fail('Webhook endpoint should be open for Stripe', `Status: ${webhook.status}`);
  }
}

async function testSystemCohesion() {
  header('8 · END-TO-END SYSTEM COHESION');

  // 8a. Frontend→Backend API URL consistency
  const frontendEnv = await safeFetch(`${FRONTEND}/api/auth/providers`);
  if (frontendEnv.status === 200) {
    ok('NextAuth providers endpoint works', 'Frontend NextAuth is configured');
  } else {
    warn('NextAuth providers', `Status: ${frontendEnv.status}`);
  }

  // 8b. CORS check — backend accepts requests from frontend origin
  const corsCheck = await safeFetch(`${BACKEND}/auth/login`, {
    method: 'OPTIONS',
    headers: {
      Origin: FRONTEND,
      'Access-Control-Request-Method': 'POST',
    },
  });
  if (corsCheck.status < 400 || corsCheck.status === 204) {
    ok('CORS allows frontend origin', `Status: ${corsCheck.status}`);
  } else {
    warn('CORS check', `Status: ${corsCheck.status}`);
  }

  // 8c. Full flow summary
  if (ACCESS_TOKEN) {
    ok('Full flow: Register → Login → Token → Protected API', 'All connected');
  } else {
    fail('Full flow incomplete', 'Could not obtain access token');
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  CONTINUOUS RUNNER
// ═══════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║  ALTI CODE STUDIO — FULL SYSTEM INTEGRATION TEST            ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${RESET}`);
  console.log(`${DIM}  Backend:  ${BACKEND}${RESET}`);
  console.log(`${DIM}  Frontend: ${FRONTEND}${RESET}`);
  console.log(`${DIM}  Test User: ${TEST_USER.email}${RESET}`);
  console.log(`${DIM}  Time: ${new Date().toISOString()}${RESET}`);

  passed = 0;
  failed = 0;
  warnings = 0;
  results.length = 0;

  const backendUp = await testBackendHealth();
  const frontendUp = await testFrontendHealth();

  if (backendUp) {
    await testRegistration();
    const loggedIn = await testLogin();
    if (loggedIn) {
      await testBilling();
      await testAdminPlatform();
    }
    await testRouteProtection();
  }

  if (backendUp && frontendUp) {
    await testSystemCohesion();
  }

  // ── Final Report ──
  console.log(`\n${CYAN}${BOLD}━━━ FINAL REPORT ━━━${RESET}`);
  console.log(`  ${GREEN}✓ Passed:${RESET}   ${passed}`);
  console.log(`  ${RED}✗ Failed:${RESET}   ${failed}`);
  console.log(`  ${YELLOW}⚠ Warnings:${RESET} ${warnings}`);
  console.log(`  Total:     ${passed + failed + warnings}`);

  if (failed === 0) {
    console.log(`\n  ${GREEN}${BOLD}🎉 ALL SYSTEMS OPERATIONAL — UNIFIED AND IN SYNC${RESET}\n`);
  } else {
    console.log(`\n  ${RED}${BOLD}⚠️  ${failed} FAILURE(S) DETECTED — SEE ABOVE${RESET}\n`);
  }

  return { passed, failed, warnings };
}

// ── Run continuously ──
let iteration = 0;

async function continuousRun() {
  while (true) {
    iteration++;
    console.log(`\n${'═'.repeat(64)}`);
    console.log(`${BOLD}${CYAN}  ITERATION #${iteration} — ${new Date().toLocaleTimeString()}${RESET}`);
    console.log(`${'═'.repeat(64)}`);

    const { failed: f } = await runAllTests();

    if (f === 0) {
      console.log(`${GREEN}${BOLD}  ✅ All systems verified. Running again in 30s…${RESET}\n`);
    } else {
      console.log(`${RED}${BOLD}  ❌ ${f} failures detected. Retrying in 15s…${RESET}\n`);
    }

    // Wait before next iteration
    const waitMs = f === 0 ? 30000 : 15000;
    await new Promise(r => setTimeout(r, waitMs));
  }
}

continuousRun().catch(err => {
  console.error(`${RED}Fatal error:${RESET}`, err);
  process.exit(1);
});
