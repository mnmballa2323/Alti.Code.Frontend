import express from 'express';
import { painterController } from './painter.controller.js';

const router = express.Router();

router.post('/paint', painterController.paintComponent);

export const painterRoutes = router;
