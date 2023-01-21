/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            reporter: ['json'],
        },
        globalSetup: './src/testing/globalSetup.ts',
        setupFiles: './src/testing/setup.ts',
    },
});
