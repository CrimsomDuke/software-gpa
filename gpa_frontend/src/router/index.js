import { createRouter, createWebHistory } from "vue-router";

// Views
import Home from '../views/HomeView.vue';
import DashboardView from "../views/DashboardView.vue";
import EmployeesView from "../views/EmployeesView.vue";
import DepartmentsView from "../views/DepartmentsView.vue";
import PositionsView from "../views/PositionsView.vue";
import ReportsView from "../views/ReportsView.vue";
import About from '../views/AboutView.vue';

// Auth
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";

// Seguridad
import ListaUsuariosView from '../views/seguridad/ListaUsuariosView.vue';
import Guards from "./guards";

//clasificadores
import ListaNivelesCuentaView from '../views/clasificadores/niveles_cuenta/ListaNivelesCuentaView.vue';
import NivelCuentaForm from '../views/clasificadores/niveles_cuenta/NivelCuentaForm.vue';
import ListaTiposCuenaView from "@/views/clasificadores/tipos_cuenta/ListaTiposCuenaView.vue";
import TipoCuentaForm from "@/views/clasificadores/tipos_cuenta/TipoCuentaForm.vue";

const routes = [
    //require login
    { path: '/', name: 'Home', component : Home, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/about', name: 'About', component: About, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/seguridad/usuarios', name: 'Usuarios', component: ListaUsuariosView, beforeEnter: Guards.IsAuthenticatedGuard },

    { path: '/dashboard', name: 'Dashboard', component: DashboardView, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/employees', name: 'Employees', component: EmployeesView, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/departments', name: 'Departments', component: DepartmentsView, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/positions', name: 'Positions', component: PositionsView, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/reports', name: 'Reports', component: ReportsView, beforeEnter: Guards.IsAuthenticatedGuard },

    //CLASIFICADORES
    { path: '/clasificadores/niveles_cuenta', name: 'Niveles de Cuenta', component: ListaNivelesCuentaView, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/clasificadores/niveles_cuenta/form', name: 'NivelCuentasFormCreate', component: NivelCuentaForm, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/clasificadores/niveles_cuenta/form/:id', name: 'NivelCuentasFormEdit', component: NivelCuentaForm, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/clasificadores/tipos_cuenta', name: 'TiposCuenta', component: ListaTiposCuenaView, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/clasificadores/tipos_cuenta/form', name: 'TipoCuentasFormCreate', component: TipoCuentaForm, beforeEnter: Guards.IsAuthenticatedGuard },
    { path: '/clasificadores/tipos_cuenta/form/:id', name: 'TipoCuentasFormEdit', component: TipoCuentaForm, beforeEnter: Guards.IsAuthenticatedGuard },

    //auth routes
    { path: '/login', name: 'Login', component : LoginView },
    { path: '/register', name: 'Register', component : RegisterView },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})


export default router;
