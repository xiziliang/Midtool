import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { $router } from '@/router'
import directives from '@/directives'
import App from './App.vue'

import '@unocss/reset/tailwind.css'

import ElementPlus from 'element-plus'

import "./styles/index.scss"

const app = createApp(App)
const pinia = createPinia()

app
.use($router)
.use(pinia)
.use(directives)
.use(ElementPlus)
.mount('#app')
