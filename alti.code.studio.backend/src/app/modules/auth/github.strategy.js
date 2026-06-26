/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Strategy as GithubStrategy } from 'passport-github2';
import config from '../../../../config/index.js';
import { UserRepository } from './prisma.user.repository.js';
import { logger } from '../../../shared/logger.js';

const githubStrategy = new GithubStrategy(
  {
    clientID: config.github.clientId || 'mock-github-client-id',
    clientSecret: config.github.clientSecret || 'mock-github-client-secret',
    callbackURL: config.github.callbackUrl,
    scope: ['user:email'], // Request email scope
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let email = null;
      if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
      }

      // Fallback if no public email exists
      if (!email) {
        email = `${profile.username || profile.id}@github.com`;
      }

      const id = profile.id;
      const avatar =
        profile.photos && profile.photos.length > 0
          ? profile.photos[0].value
          : null;

      logger.info(`[GitHub OAuth] Authenticating user: ${email}`);

      const user = await UserRepository.upsertSocialUser({
        email,
        id,
        provider: 'github',
        avatar,
      });

      return done(null, user);
    } catch (error) {
      logger.error('[GitHub OAuth Error]:', error);
      return done(error, null);
    }
  },
);

export default githubStrategy;
