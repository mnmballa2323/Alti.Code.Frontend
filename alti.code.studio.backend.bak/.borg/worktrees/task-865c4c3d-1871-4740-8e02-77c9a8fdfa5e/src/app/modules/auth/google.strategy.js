/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../../../../config/index.js';
import UserModel from './auth.model.js';
import { logger } from '../../../shared/logger.js';

const googleStrategy = new GoogleStrategy(
    {
        clientID: config.google.clientId || 'mock-client-id', // Fallback for testing
        clientSecret: config.google.clientSecret || 'mock-client-secret',
        callbackURL: config.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // logger.info('Google Profile:', profile);
            const email = profile.emails[0].value;
            const googleId = profile.id;
            const avatar = profile.photos[0]?.value;

            let user = await UserModel.findOne({ email });

            if (user) {
                // If user exists but no googleId (legacy or email/pass user), link it
                if (!user.googleId) {
                    user.googleId = googleId;
                    user.provider = 'google';
                    if (!user.avatar) user.avatar = avatar;
                    await user.save();
                }
                return done(null, user);
            }

            // Create new user
            user = await UserModel.create({
                email,
                googleId,
                avatar,
                provider: 'google',
                role: 'user', // Default role
                isSubscribed: false,
            });

            return done(null, user);
        } catch (error) {
            logger.error('Google Auth Error:', error);
            return done(error, null);
        }
    }
);

export default googleStrategy;
