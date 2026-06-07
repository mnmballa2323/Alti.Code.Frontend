/**
 * Copyright (c) 2024 Inso Code
 * 
 * swarm.validation.js
 */

import { z } from 'zod';

export const routeQueryZodSchema = z.object({
    body: z.object({
        query: z.string({
            required_error: 'Query is required',
        }).min(3, 'Query must be at least 3 characters long').max(2000, 'Query cannot exceed 2000 characters'),
    }),
});

export const dispatchQueryZodSchema = z.object({
    body: z.object({
        query: z.string({
            required_error: 'Query is required',
        }).min(3, 'Query must be at least 3 characters long').max(4000, 'Query cannot exceed 4000 characters'),
        contextData: z.array(z.any()).optional(),
    }),
});

export const fanoutQueryZodSchema = z.object({
    body: z.object({
        query: z.string({
            required_error: 'Query is required',
        }).min(3, 'Query must be at least 3 characters long').max(4000, 'Query cannot exceed 4000 characters'),
        contextData: z.array(z.any()).optional(),
        n: z.number().int().min(1).max(10).optional(),
    }),
});

export const SwarmValidation = {
    routeQueryZodSchema,
    dispatchQueryZodSchema,
    fanoutQueryZodSchema
};
