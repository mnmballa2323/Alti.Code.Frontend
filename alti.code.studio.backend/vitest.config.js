
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./polyfill.js'],
        include: ['**/*.test.js', '**/*.spec.js'],
        exclude: [
            '**/node_modules/**',
            '**/logs/**',
            '**/temp_phase16/**',
            '**/alti.code.studio.backend.azure/**',
            '**/submodules/**',
        ],
    },
});
