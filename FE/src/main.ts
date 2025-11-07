import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './routing'
import Dialog from './components/ui/Dialog.vue'

const app = createApp(App)

app.component('Dialog', Dialog)

app.use(createPinia())
app.use(router)

app.mount('#app')
