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
      name: 'host-app',
      remotes: {
        firstApp: 'http://localhost:3001/assets/remoteEntry.js',
        secondApp: 'http://localhost:3003/assets/remoteEntry.js',
        creditApp: 'http://localhost:3004/remoteEntry.js'
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
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext'
  }
})
