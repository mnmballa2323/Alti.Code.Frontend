/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../../../../config/index.js';
import { UserRepository } from './prisma.user.repository.js';
import { logger } from '../../../shared/logger.js';

const googleStrategy = new GoogleStrategy(
    {
        clientID: config.google.clientId || 'mock-google-client-id',
        clientSecret: config.google.clientSecret || 'mock-google-client-secret',
        callbackURL: config.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            if (!profile.emails || profile.emails.length === 0) {
                return done(new Error('Google profile did not return any email address.'), null);
            }
            
            const email = profile.emails[0].value;
            const id = profile.id;
            const avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

            logger.info(`[Google OAuth] Authenticating user: ${email}`);

            const user = await UserRepository.upsertSocialUser({
                email,
                id,
                provider: 'google',
                avatar,
            });

            return done(null, user);
        } catch (error) {
            logger.error('[Google OAuth Error]:', error);
            return done(error, null);
        }
    }
);

export default googleStrategy;
