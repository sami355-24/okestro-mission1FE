import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': { // /api로 시작하는 모든 요청을 프록시
        target: 'http://localhost:8080', // 로컬 스프링 부트 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // /api 경로를 제거
        ws: true // 웹소켓 프록시 활성화
        // secure: false,
      },
    },
  },
  define: {
    global: 'window'
  },
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false,
        api: 'modern',
      },
    },
  },
})
