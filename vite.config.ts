import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        allowedHosts: ['finalist-stargazer-yesterday.ngrok-free.dev'],
    },
    build: {
        rollupOptions: {
            maxParallelFileOps: 128,
        },
    },
});
