/**
 * Copyright (c) 2024 Inso Code
 *
 * orchestrator.validation.js
 */

import { z } from 'zod';

export const missionZodSchema = z.object({
  body: z.object({
    mission: z
      .string({
        required_error: 'Mission string is required',
      })
      .min(5, 'Mission must be at least 5 characters long')
      .max(10000, 'Mission payload is too large'),
    context: z.array(z.any()).optional(),
  }),
});

export const OrchestratorValidation = {
  missionZodSchema,
};
