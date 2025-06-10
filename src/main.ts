import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createWebHistory, createRouter } from 'vue-router'

import VmView from './views/VmView.vue'
import App from './App.vue'

const routes = [
  { path: '/', redirect: '/vms' },
  { path: '/vms', component: VmView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(createPinia()).use(router).mount('#app')
