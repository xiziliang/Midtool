/// <reference types="node" />

import { defineConfig, createLogger } from 'vite'
import * as path from 'path'

import Vue from '@vitejs/plugin-vue'
import PluginTs from 'vite-plugin-ts'
import VueMacros from 'unplugin-vue-macros/vite'
import Unocss from 'unocss/vite'

const rootPath = __dirname;
const logger = createLogger();

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(rootPath, 'src')}`,
    },
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(), 
      }
    }),
    PluginTs(),
    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss({
      mode: 'vue-scoped',
    }),
  ],
  assetsInclude: [
    '**/*.png',
    '**/*.webp',
    '**/*.jpg',
    '**/*.jpeg',
  ],
  server: {
    host: '0.0.0.0',
    open: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://121.199.27.226:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure(proxy) {
          proxy.on('proxyReq', function (proxyReq) {
            logger.info(`${proxyReq.method} ${this.options.target.replace(/\/$/, '')}${proxyReq.path}`, { timestamp: true });
          });
          proxy.on('proxyRes', (proxyRes, proxyReq) => {
            proxyRes.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
          });
        },
      }
    }
  },
})
