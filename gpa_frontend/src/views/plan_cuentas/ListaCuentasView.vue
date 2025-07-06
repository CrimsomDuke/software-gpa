
<script setup>
import { onMounted, ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import global_vars from '@/config/global_vars';

const errorMessage = ref(null);

const cuentas = ref([]);

onMounted(async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/cuenta`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.ok) {
      cuentas.value = data;
    } else {
      errorMessage.value = 'Error al cargar las cuentas: ' + (data.message || 'Desconocido');
    }
    
  } catch (error) {
    errorMessage.value = 'Error al cargar las cuentas';
    console.error(error);
  }
});

</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div>
        <h2>Catálogo de Cuentas Contables</h2>
        <router-link to="/plan_cuentas/cuentas/form" class="btn btn-primary m-2"> + Crear cuenta</router-link>
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
                <th class="gradient-blue text-white">Cuenta Padre</th>
                <th class="gradient-blue text-white">Objeto Gasto</th>      
                <th class="gradient-blue text-white">Estado</th>
                <th class="gradient-blue text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cuenta in cuentas" :key="cuenta.id">
                <td class="text-center">{{ cuenta.codigo }}</td>
                <td class="text-center">{{ cuenta.nombre }}</td>
                <td class="text-center">{{ cuenta.descripcion }}</td>
                <td class="text-center">{{ cuenta.tipo_cuenta ? cuenta.tipo_cuenta.nombre : '-N/A-' }}</td>
                <td class="text-center">{{ cuenta.nivel_cuenta ? cuenta.nivel_cuenta.nombre : '-N/A-' }}</td>
                <td class="text-center">{{ cuenta.padre ? cuenta.padre.nombre : '-N/A-' }}</td>
                <td class="text-center">{{ cuenta.objeto_gasto ? cuenta.objeto_gasto.nombre : '-N/A-' }}</td>
                <td class="text-center">
                  <span class="badge" :class="cuenta.esta_activa ? 'bg-success' : 'bg-secondary'">
                    {{ cuenta.esta_activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="text-center">
                  <router-link :to="{ name: 'CuentasFormEdit', params: { id: cuenta.id } }"
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