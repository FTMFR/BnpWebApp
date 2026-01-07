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
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://46.249.102.43:5000',
        changeOrigin: true,
        secure: false,
        ws: true, // برای WebSocket support
        // اگر بک‌اند شما انتظار /api را ندارد، این خط را uncomment کنید:
        // rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          });
        },
      },
    },
    cors: true,
  },

  preview: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://46.249.102.43:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        // اضافه کردن این تنظیمات برای CORS بهتر:
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // برای OPTIONS request
            if (req.method === 'OPTIONS') {
              proxyReq.setHeader('Access-Control-Allow-Origin', '*');
              proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
              proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
              proxyReq.setHeader('Origin', 'http://46.249.102.43:5000');
            }
          });

          proxy.on('proxyRes', (proxyRes, req) => {
            // تنظیمات CORS در response
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';
            proxyRes.headers['Access-Control-Max-Age'] = '86400';
          });
        },
      },
    },
    cors: true,
  },

  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq, req) => {
      // برای OPTIONS request
      if (req.method === 'OPTIONS') {
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
        proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      }
    });
    // ... بقیه کد
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
