import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './routing'
import Dialog from './components/ui/Dialog.vue'

import { createHead } from '@vueuse/head'

const app = createApp(App)
const head = createHead()

app.component('Dialog', Dialog)

app.use(createPinia())
app.use(router)
app.use(head)

app.mount('#app')
