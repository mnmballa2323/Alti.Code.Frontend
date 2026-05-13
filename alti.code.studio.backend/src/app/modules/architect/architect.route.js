import express from 'express';
import { architectController } from './architect.controller.js';

const router = express.Router();

router.post('/terraform', architectController.generateTerraform);
router.post('/docker', architectController.dockerize);
router.post('/k8s', architectController.generateK8s);

export const architectRoutes = router;
