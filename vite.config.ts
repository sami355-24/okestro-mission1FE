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
        // secure: false,
      },
    },
  },
  // 환경 변수 설정
  define: {
    'process.env': {}, // Vite는 process.env를 직접 제공하지 않으므로, 이 부분을 추가해야 process.env.VUE_APP_API_BASE_URL 접근 가능
    global: 'window',
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
