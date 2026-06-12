/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as zod from 'zod';
const { z } = zod;

const userRoleValues = ['tenant', 'landlord', 'admin', 'unauthorized', 'owner'];

const UserValidationSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email()
      .refine(value => value !== undefined, {
        message: 'Please provide a unique email',
      }),
    password: z
      .string()
      .refine(value => value !== undefined, {
        message: 'Please provide a password',
      }),
    confirmPassword: z.string(),
    role: z.enum(userRoleValues).default('unauthorized'),
    profile: z.string().optional(),
    confirmationToken: z.string().optional(),
    confirmationTokenExpires: z.date().optional(),
  }).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
      });
    }
  })
});
const loginZodSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh Token is required',
    }),
  }),
});

const socialLoginZodSchema = z.object({
  body: z.object({
    email: z.string().email(),
    id: z.string(),
    provider: z.enum(['google', 'github']),
    avatar: z.string().url().optional().or(z.string().length(0)),
  }),
});

export const AuthValidation = {
  UserValidationSchema,
  loginZodSchema,
  refreshTokenZodSchema,
  socialLoginZodSchema,
};

