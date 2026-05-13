/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from "express";
import { GeminiCliController } from "./geminiCli.controller.js";

const router = express.Router();

router.post("/ask", GeminiCliController.createCheckoutSession);


export const geminiCliRoutes = router;
