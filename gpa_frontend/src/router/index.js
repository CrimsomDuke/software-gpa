import { createRouter, createWebHistory } from "vue-router";

import Home from '../views/HomeView.vue';
import About from '../views/AboutView.vue';
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";

const routes = [
    { path: '/', name: 'Home', component : Home },
    { path: '/about', name: 'About', component : About },

    //auth routes
    { path: '/login', name: 'Login', component : LoginView },
    { path: '/register', name: 'Register', component : RegisterView },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;