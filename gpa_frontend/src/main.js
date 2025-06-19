import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import { createPinia } from 'pinia'

const pinia = createPinia();
const app = createApp(App)

//pinia para los stores
app.use(pinia)

//agregar el router
app.use(router)

app.mount('#app')
