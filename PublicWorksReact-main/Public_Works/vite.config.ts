// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()]
//   // server: {
//   //   port: 5173, // specify your port
//   // },
// })
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';  // ✅ import from vitest/config
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
