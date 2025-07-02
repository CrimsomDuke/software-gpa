<template>
  <nav class="sidebar">
    <h1 class="logo">Sao Digital</h1>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li class="has-submenu" @click="toggleSubmenu('clasificadores')">
        <div class="menu-item">
          <span>Clasificadores</span>
          <span class="arrow" :class="{ rotated: openSubmenus.clasificadores }">›</span>
        </div>
        <ul class="submenu" v-show="openSubmenus.clasificadores">
          <li><router-link to="/clasificadores/niveles_cuenta">Niveles de Cuenta</router-link></li>
          <li><router-link to="/clasificadores/tipos_cuenta">Tipos de cuenta</router-link></li>
          <li><router-link to="/clasificadores/centros_costo">Centros de Costo</router-link></li>
          <li><router-link to="/clasificadores/objetos_gasto">Objetos de Gasto</router-link></li>
        </ul>
      </li>
      <li>
        <div class="menu-item" @click="toggleSubmenu('seguridad')">
          <span>Seguridad</span>
          <span class="arrow" :class="{ rotated: openSubmenus.seguridad }">›</span>
        </div>
        <ul class="submenu" v-show="openSubmenus.seguridad">
          <li><router-link to="/seguridad/usuarios">Usuarios</router-link></li>
          <li><router-link to="/seguridad/roles">Roles</router-link></li>
        </ul>
      </li>
      <li>
        <div class="menu-item" @click="toggleSubmenu('Presupuesto')">
          <span>Presupuesto</span>
          <span class="arrow" :class="{ rotated: openSubmenus.Presupuesto }">›</span>
        </div>
        <ul class="submenu" v-show="openSubmenus.Presupuesto">
          <li><router-link to="/clasificadores/PresupuestoView">Presupuesto</router-link></li>
          <li><router-link to="/presupuesto/ejecucion">Ejecución de Presupuesto</router-link></li>
        </ul>
      </li>

      <li><router-link to="/plan_cuentas/cuentas">Plan de cuentas</router-link></li>
      <li class="has-submenu" @click="toggleSubmenu('contable')">
        <div class="menu-item">
          <span>Contable</span>
          <span class="arrow" :class="{ rotated: openSubmenus.contable }">›</span>
        </div>
        <ul class="submenu" v-show="openSubmenus.contable">
          <li><router-link to="/contable/transacciones">Transacciones</router-link></li>
          <li><router-link to="/contable/transacciones/nueva">Nueva Transacción</router-link></li>
          <li><router-link to="/contable/periodos_fiscales">Periodos Fiscales</router-link></li>
          <li><router-link to="/contable/traspaso-saldos">Traspaso de Saldos</router-link></li>
          <li><router-link to="/informes/exportar">Exportar Transacciones</router-link></li>
        </ul>
      </li>
      <li>
        <div class="menu-item" @click="toggleSubmenu('informes')">
          <span>Informes</span>
          <span class="arrow" :class="{ rotated: openSubmenus.informes }">›</span>
        </div>
        <ul class="submenu" v-show="openSubmenus.informes">
          <li><router-link to="/informes/libro_mayor">Libro Mayor</router-link></li>
          <li><router-link to="/informes/libro_diario">Libro Diario</router-link></li>
          <li><router-link to="/informes/balance_general">Balance General</router-link></li>
          <li><router-link to="/informes/estado_resultados">Estado de Resultados</router-link></li>
          <li><router-link to="/informes/balance_comprobacion">Balance de Comprobación</router-link></li>
        </ul>
      </li>
      <li><router-link to="/dashboard">Dashboard</router-link></li>
      <li>
        <div class="menu-item" @click="toggleSubmenu('opciones')">
          <span>Opciones</span>
          <span class="arrow" :class="{ rotated: openSubmenus.opciones }">›</span>
        </div>
        <ul class="submenu" v-show="openSubmenus.opciones">
          <li><button v-on:click="logout">Cerrar sesión</button></li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup>

import global_vars from '@/config/global_vars';
import { ref } from 'vue';

const openSubmenus = ref({
  clasificadores: false,
  seguridad: false,
  informes: false,
  contable: false,
  opciones: false,
});

const toggleSubmenu = (menu) => {
  openSubmenus.value[menu] = !openSubmenus.value[menu];
};

const logout = async() => {
  sessionStorage.removeItem('user_id');
  window.location.href = global_vars.BASE_URL + '/login';
}

</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #0f1355, #000000);
  padding-top: 30px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}


.sidebar h1 {
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin: 10px 0;
}

.sidebar a, .sidebar button {
  color: white;
  text-decoration: none;
  display: block;
  padding: 12px 20px;
  font-size: 16px;
}

.sidebar a.router-link-exact-active {
  background: linear-gradient(to right, #386dff, #000000);
  color: white;
}

.sidebar button{
    background: linear-gradient(to right, #df3434, #000000);
    color: white;
    width: 100%;
}

.has-submenu {
  cursor: pointer;
  position: relative;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  color: white;
}

.arrow {
  transition: transform 0.3s ease;
  font-size: 18px;
}

.arrow.rotated {
  transform: rotate(90deg);
}

.submenu {
  background: rgba(0, 0, 0, 0.2);
  padding-left: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submenu a {
  padding: 10px 20px;
  font-size: 14px;
}

.submenu a.router-link-exact-active {
  background: rgba(27, 66, 172, 0.3);
}

.sidebar a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.has-submenu:hover .menu-item {
  background: rgba(255, 255, 255, 0.1);
}
</style>
