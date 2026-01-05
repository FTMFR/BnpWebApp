import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    mode === 'development' && vueDevTools(), // only in dev
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5117',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    commonjsOptions: {
      include: [/primevue/, /@primeuix/],
    },
  },
}))
