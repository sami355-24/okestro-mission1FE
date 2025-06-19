import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createWebHistory, createRouter } from 'vue-router'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import VmView from './views/VmView.vue'
import VmDetailView from './views/VmDetailView.vue'
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
})

const routes = [
  { path: '/', redirect: '/vms' },
  { path: '/vms', component: VmView },
  { path: '/vm/:vmId', component: VmDetailView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app')
