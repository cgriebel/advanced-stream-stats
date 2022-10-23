import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    // required to prevent net::ERR_ADDRESS_INVALID error when calling 0.0.0.0:5173 on windows in docker
    server: {
        hmr: {
            host: "localhost",
        },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
