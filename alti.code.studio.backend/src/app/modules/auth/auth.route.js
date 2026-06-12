/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import passport from 'passport';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import createRateLimiter from '../../middlewares/rateLimit/authLimiter.js';
import { validateRequest } from '../../middlewares/validateRequest/validateRequest.js';
import { authController } from './auth.controller.js';
import { AuthValidation } from './auth.validation.js';
import { createSamlStrategy, createOIDCStrategy } from './enterprise.strategy.js';
import { prisma } from '../../../config/prisma.js';
// import { validateRequest } from '../../middlewares/validateRequest/validateRequest.js';

const router = express.Router();

router
  .route('/user/single-user')
  .get(auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER), authController.getUser); // user with id

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and User Management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.route('/register').post(
  // createRateLimiter(5, 2),
  // validateRequest(AuthValidation.UserValidationSchema),
  authController.register,
);
router.route('/register/confirmation/:token').get(authController.confirmEmail); // verify mail

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.route('/login').post(createRateLimiter(5, 5), authController.login); // login in app
router
  .route('/social-login')
  .post(
    validateRequest(AuthValidation.socialLoginZodSchema),
    authController.socialLogin,
  );

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenZodSchema),
  authController.refreshToken,
);

router
  .route('/forget-password')
  .post(createRateLimiter(5, 2), authController.forgetPassword);
router
  .route('/reset-password')
  .post(createRateLimiter(5, 1), authController.resetPassword);
router
  .route('/change-password')
  .post(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    // createRateLimiter(10, 1),
    authController.changePassword,
  );

router
  .route('/update-user/:userId')
  .put(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    authController.updateUser,
  ); // is to use update user profile
router
  .route('/delete-account-otp/:id')
  .delete(authController.deleteUserAccountOTP); // use to delete account
router
  .route('/delete-account/:id')
  .delete(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    authController.deleteUserAccount,
  ); // use to delete account

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleAuthCallback,
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] }),
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  authController.githubAuthCallback,
);

// Keycloak SAML SSO Routes
router.get('/saml/login/:tenantId', async (req, res, next) => {
  const { tenantId } = req.params;
  try {
    const tenantConfig = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenantConfig || !tenantConfig.samlEntryPoint) {
      return res.status(400).json({ error: 'SAML not configured for this tenant.' });
    }
    const strategyName = `saml-${tenantId}`;
    if (!passport._strategies[strategyName]) {
      passport.use(strategyName, createSamlStrategy(tenantConfig));
    }
    passport.authenticate(strategyName, {
      additionalParams: { RelayState: tenantId },
    })(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post('/saml/callback', async (req, res, next) => {
  const tenantId = req.body.RelayState;
  if (!tenantId) {
    return res.status(400).json({ error: 'RelayState/tenantId is required.' });
  }
  const strategyName = `saml-${tenantId}`;
  passport.authenticate(strategyName, { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'SSO Authentication failed.' });
    req.user = user;
    authController.ssoAuthCallback(req, res, next);
  })(req, res, next);
});

// Keycloak OIDC SSO Routes
router.get('/oidc/login/:tenantId', async (req, res, next) => {
  const { tenantId } = req.params;
  try {
    const tenantConfig = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenantConfig || !tenantConfig.oidcIssuer) {
      return res.status(400).json({ error: 'OIDC not configured for this tenant.' });
    }
    const strategyName = `oidc-${tenantId}`;
    if (!passport._strategies[strategyName]) {
      passport.use(strategyName, createOIDCStrategy(tenantConfig));
    }
    passport.authenticate(strategyName)(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/oidc/callback', async (req, res, next) => {
  const tenantId = req.query.state || req.session?.tenantId; 
  if (!tenantId) {
    return res.status(400).json({ error: 'State/tenantId is required.' });
  }
  const strategyName = `oidc-${tenantId}`;
  passport.authenticate(strategyName, { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'SSO Authentication failed.' });
    req.user = user;
    authController.ssoAuthCallback(req, res, next);
  })(req, res, next);
});

export const authRoutes = router;
