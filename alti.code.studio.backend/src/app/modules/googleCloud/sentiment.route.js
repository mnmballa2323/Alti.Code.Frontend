import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { SentimentController } from './sentiment.controller.js';

const router = express.Router();

router.post(
    '/analyze',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    SentimentController.analyzeSentiment
);

export const SentimentRoutes = router;
