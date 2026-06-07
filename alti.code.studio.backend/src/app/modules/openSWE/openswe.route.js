/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from "express";
import { OpenSWEController } from "./openswe.controller.js";

const router = express.Router();

router.post("/analyze", OpenSWEController.analyze);
router.post("/apply-change", OpenSWEController.applyChange);

export const openSWERoutes = router;
