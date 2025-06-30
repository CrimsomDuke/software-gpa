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

// Clasificadores
import ListaNivelesCuentaView from '../views/clasificadores/niveles_cuenta/ListaNivelesCuentaView.vue';
import NivelCuentaForm from '../views/clasificadores/niveles_cuenta/NivelCuentaForm.vue';
import ListaTiposCuenaView from "@/views/clasificadores/tipos_cuenta/ListaTiposCuenaView.vue";
import TipoCuentaForm from "@/views/clasificadores/tipos_cuenta/TipoCuentaForm.vue";
import CentroDeCostoView from "@/views/clasificadores/CentroDeCosto/CentroDeCostoView.vue";
import ObjetoDeGastosView from "@/views/clasificadores/ObjetoDeGastos/ObjetoDeGastosView.vue";
import UsuarioForm from "@/views/seguridad/UsuarioForm.vue";
import ListaCuentasView from "@/views/plan_cuentas/ListaCuentasView.vue";
import LibroMayorView from "@/views/informes/LibroMayorView.vue";
import LibroDiarioView from "@/views/informes/LibroDiarioView.vue";
import BalanceGeneralView from "@/views/informes/BalanceGeneralView.vue";
import BalanceComprobacionView from "@/views/informes/BalanceComprobacionView.vue";
import EstadoResultadosView from "@/views/informes/EstadoResultadosView.vue";
import PeriodosFiscales from "@/views/contable/PeriodosFiscales.vue";
import TransaccionesContables from "@/views/contable/TransaccionesContables.vue";
import ExportarView from "@/views/informes/ExportarView.vue";

// Presupuesto
import EjecucionPresupuestoView from "@/views/clasificadores/Presupuesto/EjecucionPresupuestoView.vue";
import PresupuestoView from "@/views/clasificadores/Presupuesto/PresupuestoView.vue";
import ListaRolesView from "@/views/seguridad/ListaRolesView.vue";
import CentroDeCostoForm from "@/views/clasificadores/CentroDeCosto/CentroDeCostoForm.vue";
import ObjetoDeGastoForm from "@/views/clasificadores/ObjetoDeGastos/ObjetoDeGastoForm.vue";
import RolForm from "@/views/seguridad/RolForm.vue";

const routes = [
    // Require login
    { path: '/', name: 'Home', component: Home, beforeEnter: await Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },
    { path: '/about', name: 'About', component: About, beforeEnter: await Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },

    //SEGURIDAD
    { path: '/seguridad/usuarios', name: 'Usuarios', component: ListaUsuariosView, beforeEnter: await Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 10 } },
    { path: '/seguridad/usuarios/form', name: 'UsuariosFormCreate', component: UsuarioForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 10 } },
    { path: '/seguridad/usuarios/form/:id', name: 'UsuariosFormEdit', component: UsuarioForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 10 } },
    { path: '/seguridad/roles', name: 'Roles', component: ListaRolesView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 10 } },
    { path: '/seguridad/roles/form', name: 'RolesFormCreate', component: RolForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 10 } },
    { path: '/seguridad/roles/form/:id', name: 'RolesFormEdit', component: RolForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 10 } },
    // Clasificadores
    { path: '/clasificadores/niveles_cuenta', name: 'Niveles de Cuenta', component: ListaNivelesCuentaView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/niveles_cuenta/form', name: 'NivelCuentasFormCreate', component: NivelCuentaForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/niveles_cuenta/form/:id', name: 'NivelCuentasFormEdit', component: NivelCuentaForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/tipos_cuenta', name: 'TiposCuenta', component: ListaTiposCuenaView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/tipos_cuenta/form', name: 'TipoCuentasFormCreate', component: TipoCuentaForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/tipos_cuenta/form/:id', name: 'TipoCuentasFormEdit', component: TipoCuentaForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/centros_costo', name: 'CentrosCosto', component: CentroDeCostoView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/centros_costo/form', name: 'CentroCostoFormCreate', component: CentroDeCostoForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/centros_costo/form/:id', name: 'CentroCostoFormEdit', component: CentroDeCostoForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/objetos_gasto', name: 'ObjetosGasto', component: ObjetoDeGastosView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/objetos_gasto/form', name : 'ObjetoGastoFormCreate', component: ObjetoDeGastoForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    { path: '/clasificadores/objetos_gasto/form/:id', name : 'ObjetoGastoFormEdit', component: ObjetoDeGastoForm, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 5 } },
    
    // Presupuesto
    { path: '/presupuesto/ejecucion', name: 'EjecucionPresupuesto', component: EjecucionPresupuestoView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },
    { path: '/clasificadores/PresupuestoView', name: 'PresupuestoView', component: PresupuestoView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },

    //CONTABLE
    { path: '/contable/periodos_fiscales', name: 'PeriodosFiscales', component: PeriodosFiscales, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },
    { path: '/contable/transacciones', name: 'TransaccionesContables', component: TransaccionesContables, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },

    //PLAN DE CUENTAS
    { path: '/plan_cuentas/cuentas', name: 'Cuentas', component: ListaCuentasView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },

    //INFORMES
    { path: '/informes/libro_mayor', name: 'LibroMayor', component: LibroMayorView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },
    { path: '/informes/libro_diario', name: 'LibroDiario', component: LibroDiarioView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },
    { path: '/informes/balance_general', name:'BalanceGeneral', component: BalanceGeneralView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },
    {path: '/informes/balance_comprobacion', name: 'BalanceComprobacion', component: BalanceComprobacionView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },
    {path: '/informes/estado_resultados', name: 'EstadoResultados', component: EstadoResultadosView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },
    {path: '/informes/exportar', name: 'Exportar', component: ExportarView, beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 } },

    //auth routes
    { path: '/login', name: 'Login', component : LoginView },
    { path: '/register', name: 'Register', component : RegisterView },

        // Redirects// En tu archivo de rutas
    {
      path: '/contable/transacciones/nueva',
      name: 'NuevaTransaccion',
      component: () => import('@/views/contable/FormTransacciones.vue'),
      beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 }
    },
    {
      path: '/contable/transacciones/:id/editar',
      name: 'EditarTransaccion',
      component: () => import('@/views/contable/FormTransacciones.vue'),
      beforeEnter: Guards.IsAuthorizedRoleGuard, meta : { requiredRoleLevel : 1 }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
