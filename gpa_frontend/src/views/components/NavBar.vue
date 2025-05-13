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
      <li><router-link to="/dashboard">Dashboard</router-link></li>
    </ul>
  </nav>
</template>

<script setup>

import { ref } from 'vue';

const openSubmenus = ref({
  clasificadores: false,
  seguridad: false,
});

const toggleSubmenu = (menu) => {
  openSubmenus.value[menu] = !openSubmenus.value[menu];
};
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #0f1355, #000000);
  padding-top: 30px;
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

.sidebar a {
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
