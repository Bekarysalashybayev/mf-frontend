import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    federation({
      name: 'firstApp',
      filename: 'remoteEntry.js',
      exposes: {
        './router': './src/router/index.ts'
      },
      shared: ['vue', 'vue-router', 'pinia']
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 3001,
    host: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  build: {
    target: 'esnext'
  }
})
