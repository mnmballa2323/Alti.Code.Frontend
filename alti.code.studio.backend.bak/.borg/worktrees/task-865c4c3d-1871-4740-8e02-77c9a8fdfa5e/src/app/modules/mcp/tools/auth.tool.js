/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


export const authTools = [
    {
        name: 'auth_login',
        description: 'Login to the system to get an access token.',
        inputSchema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' }
            },
            required: ['email', 'password']
        },
        handler: async (args) => {
            try {
                // Dynamic import to avoid circular dependency
                const { authService } = await import('../../auth/auth.service.js');
                const result = await authService.loginService(args.email, args.password);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Login Failed: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        }
    },
    {
        name: 'auth_register',
        description: 'Register a new user account.',
        inputSchema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' }
            },
            required: ['email', 'password']
        },
        handler: async (args) => {
            try {
                // Dynamic import to avoid circular dependency
                const { authService } = await import('../../auth/auth.service.js');
                // Mock request object as service expects req.body
                const req = { body: args };
                const result = await authService.registerService(req);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Registration Failed: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        }
    }
];
