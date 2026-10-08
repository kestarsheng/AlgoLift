import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [vue(), tailwindcss()], server: { proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true }, '/uploads': { target: 'http://localhost:3000', changeOrigin: true } } }, test: { environment: 'jsdom', globals: true, coverage: { provider: 'v8', reporter: ['text', 'json', 'html'], include: ['src/stores/**/*.ts', 'src/components/**/*.vue', 'src/views/**/*.vue'], exclude: ['src/**/*.spec.ts'], thresholds: { statements: 70, branches: 70, functions: 70, lines: 70 } } } });
