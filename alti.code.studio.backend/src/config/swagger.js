/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Alti Code Studio API',
      version: '2.0.0',
      description: 'Production API for the Alti Code Studio AI Engineering Platform. Fully sovereign on Google Cloud.',
      contact: {
        name: 'Alti Code Studio',
        url: 'https://alticode.studio',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://api.alticode.studio/api/v1',
        description: 'Production (Cloud Run)',
      },
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token obtained from /api/v1/auth/login',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Agents', description: 'AI agent management & orchestration' },
      { name: 'Projects', description: 'Project & workspace management' },
      { name: 'Enterprise', description: 'Enterprise features (SSO, SCIM, audit)' },
      { name: 'GCP', description: 'GCP Cloud Platform health & status' },
      { name: 'Health', description: 'Health checks & readiness probes' },
    ],
  },
  apis: [
    './src/app/routes/*.js',
    './src/app/modules/**/**.route.js',
    './src/app/modules/**/**.routes.js',
  ],
};

export const specs = swaggerJsdoc(options);
