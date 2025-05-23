<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div>
        <h2>Catálogo de Cuentas Contables</h2>
        <div class="card">
          <h3 v-if="errorMessage">{{ errorMessage }}</h3>
          <table class="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th class="gradient-blue text-white">Código</th>
                <th class="gradient-blue text-white">Nombre</th>
                <th class="gradient-blue text-white">Descripción</th>
                <th class="gradient-blue text-white">Tipo</th>
                <th class="gradient-blue text-white">Nivel</th>
                <th class="gradient-blue text-white">Estado</th>
                <th class="gradient-blue text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="account in accounts" :key="account.id">
                <td class="text-center">{{ account.codigo }}</td>
                <td class="text-center" :style="{ 'padding-left': `${(account.nivel_cuenta_id - 1) * 15}px` }">
                  <span v-if="account.nivel_cuenta_id > 1" class="me-1">↳</span>
                  {{ account.nombre }}
                </td>
                <td class="text-center">{{ account.descripcion || '-' }}</td>
                <td class="text-center">{{ getAccountType(account.tipo_cuenta_id) }}</td>
                <td class="text-center">{{ getAccountLevel(account.nivel_cuenta_id) }}</td>
                <td class="text-center">
                  <span class="badge" :class="account.esta_activa ? 'bg-success' : 'bg-secondary'">
                    {{ account.esta_activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="text-center">
                  <router-link 
                    class="btn btn-primary me-2"
                  >
                    Editar
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';

// Mock data - replace with real API calls later
const accounts = ref([
  {
    id: 1,
    codigo: '1',
    nombre: 'Activos',
    descripcion: 'Todos los activos de la empresa',
    esta_activa: true,
    tipo_cuenta_id: 1,
    nivel_cuenta_id: 1,
    cuenta_padre_id: null
  },
  {
    id: 2,
    codigo: '1.1',
    nombre: 'Activos Corrientes',
    descripcion: 'Activos líquidos a corto plazo',
    esta_activa: true,
    tipo_cuenta_id: 1,
    nivel_cuenta_id: 2,
    cuenta_padre_id: 1
  },
  {
    id: 3,
    codigo: '1.1.1',
    nombre: 'Efectivo y Equivalentes',
    descripcion: 'Dinero en caja y bancos',
    esta_activa: true,
    tipo_cuenta_id: 1,
    nivel_cuenta_id: 3,
    cuenta_padre_id: 2
  },
  {
    id: 4,
    codigo: '2',
    nombre: 'Pasivos',
    descripcion: 'Todas las obligaciones',
    esta_activa: true,
    tipo_cuenta_id: 2,
    nivel_cuenta_id: 1,
    cuenta_padre_id: null
  }
]);

const accountTypes = [
  { id: 1, nombre: 'Activo' },
  { id: 2, nombre: 'Pasivo' },
  { id: 3, nombre: 'Patrimonio' }
];

const accountLevels = [
  { id: 1, nombre: 'Clase' },
  { id: 2, nombre: 'Grupo' },
  { id: 3, nombre: 'Cuenta' }
];

const errorMessage = ref(null);

// Helper functions
const getAccountType = (id) => {
  return accountTypes.find(t => t.id === id)?.nombre || 'Desconocido';
};

const getAccountLevel = (id) => {
  return accountLevels.find(l => l.id === id)?.nombre || 'Desconocido';
};


// This would be your API call in a real implementation
/*
onMounted(async () => {
  try {
    const response = await fetch('/api/accounts');
    accounts.value = await response.json();
  } catch (error) {
    errorMessage.value = 'Error al cargar las cuentas';
    console.error(error);
  }
});
*/
</script>