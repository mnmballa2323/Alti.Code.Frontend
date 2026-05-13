/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from "express";
import { GeminiCliController } from "./geminiCli.controller.js";

const router = express.Router();

// Run a single CLI command (returns full output)
router.post("/run", GeminiCliController.runCommand);

// Stream CLI command output via Server-Sent Events
router.post("/stream", GeminiCliController.streamCommand);

// Session command history
router.get("/history", GeminiCliController.getHistory);
router.delete("/history", GeminiCliController.clearHistory);

export const geminiCliRoutes = router;
