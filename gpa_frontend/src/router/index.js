import { createRouter, createWebHistory } from "vue-router";

import Home from '../views/HomeView.vue';
import About from '../views/AboutView.vue';
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";
import ListaUsuariosView from '../views/seguridad/ListaUsuariosView.vue';
import Guards from "./guards";

const routes = [
    //require login
    { path: '/', name: 'Home', component : Home, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/about', name: 'About', component : About, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/seguridad/usuarios', name: 'Usuarios', component : ListaUsuariosView, beforeEnter: Guards.IsAuthenticatedGuard },

    //auth routes
    { path: '/login', name: 'Login', component : LoginView },
    { path: '/register', name: 'Register', component : RegisterView },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})


export default router;