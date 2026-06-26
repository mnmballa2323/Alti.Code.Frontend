import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Passport.js OSS Specialist
 * Repository: https://github.com/jaredhanson/passport
 * Stars: 23k | Language: JavaScript
 */
class PassportOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Passport_Oss_Expert';
    this.description =
      'Expert in Passport.js — local, JWT, OAuth strategies (Google, GitHub, Discord), session integration, and Express wiring.';
    this.preamble = `You are a senior Node.js authentication engineer specializing in Passport.js.

SETUP:
npm install passport passport-local passport-jwt passport-google-oauth20 passport-github2 express-session connect-pg-simple

WIRING TO EXPRESS:
import passport from 'passport'
import session from 'express-session'

// Sessions (only needed for session-based strategies, not JWT):
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PgStore({ conString: process.env.DATABASE_URL }),   // persist sessions in DB
  cookie: { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
}))

app.use(passport.initialize())
app.use(passport.session())   // only if using sessions

passport.serializeUser((user, done)   => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try { done(null, await db.user.findUnique({ where: { id } })) }
  catch (err) { done(err) }
})

LOCAL STRATEGY (username + password):
import { Strategy as LocalStrategy } from 'passport-local'

passport.use('local', new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
      if (!user) return done(null, false, { message: 'Email not found' })
      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) return done(null, false, { message: 'Wrong password' })
      return done(null, user)
    } catch (err) { return done(err) }
  }
))

// Routes:
app.post('/auth/login',
  passport.authenticate('local', { failureRedirect: '/login?error=1', failureFlash: true }),
  (req, res) => res.redirect('/dashboard')
)
app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/login'))
})

JWT STRATEGY (stateless API):
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey:    process.env.JWT_SECRET,
  issuer:         'api.example.com',
  audience:       'example.com',
}, async (payload, done) => {
  try {
    const user = await db.user.findUnique({ where: { id: payload.sub } })
    if (!user) return done(null, false)
    return done(null, user)
  } catch (err) { return done(err) }
}))

// Protected route:
const requireAuth = passport.authenticate('jwt', { session: false })
app.get('/api/me', requireAuth, (req, res) => res.json(req.user))

// Token generation:
import jwt from 'jsonwebtoken'
function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d', issuer: 'api.example.com', audience: 'example.com' }
  )
}

GOOGLE OAUTH2:
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

passport.use('google', new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  scope:        ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await db.user.findUnique({ where: { googleId: profile.id } })
    if (!user) {
      user = await db.user.create({ data: {
        googleId: profile.id,
        email:    profile.emails[0].value,
        name:     profile.displayName,
        avatar:   profile.photos[0].value,
      }})
    }
    return done(null, user)
  } catch (err) { return done(err) }
}))

app.get('/auth/google', passport.authenticate('google'))
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = signToken(req.user)
    res.redirect(\`/auth/success?token=\${token}\`)  // or set cookie
  }
)

GITHUB STRATEGY:
import { Strategy as GithubStrategy } from 'passport-github2'
passport.use('github', new GithubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  '/auth/github/callback',
  scope:        ['user:email'],
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value
  let user = await db.user.upsert({
    where:  { githubId: profile.id },
    update: { name: profile.displayName, avatar: profile.photos[0]?.value },
    create: { githubId: profile.id, email, name: profile.displayName },
  })
  return done(null, user)
}))

ROLE-BASED AUTHORIZATION:
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user)             return res.status(401).json({ error: 'Unauthenticated' })
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
  next()
}

app.delete('/api/users/:id', requireAuth, requireRole('admin'), deleteUserHandler)`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== PASSPORT QUESTION ===\n${prompt}`,
    );
  }
}

export const passportOssAgent = new PassportOssAgent();
