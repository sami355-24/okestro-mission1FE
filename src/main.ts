import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createWebHistory, createRouter } from 'vue-router'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import VmView from './components/VmView.vue'
import VmDetailView from './components/VmDetailView.vue'
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
})

const routes = [
  { path: '/', redirect: '/vms' },
  { path: '/vms', component: VmView },
  { path: '/vms/:vmId', component: VmDetailView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app')
