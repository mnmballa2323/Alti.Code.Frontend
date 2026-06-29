import { z } from 'zod';

const createCheckoutSession = z.object({
  body: z.object({
    userId: z.string().optional(),
    plan_name: z.string().optional(),
    price: z.number().optional(),
    duration: z.string().optional(),
    plan: z
      .object({
        plan_name: z.string().optional(),
        price: z.number().optional(),
        duration: z.string().optional(),
      })
      .optional(),
  }),
});

export const paymentValidation = {
  createCheckoutSession,
};
