

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '@/views/components/NavBar.vue';
import global_vars from '@/config/global_vars';

const objetosGasto = ref([]);
const errorMessage = ref('');

const fetchObjetoGastos = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/objeto_gasto`);
    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message || 'Error al obtener los objetos de gasto';
    } else {
      objetosGasto.value = data;
    }
  } catch (error) {
    console.error('Error:', error);
    errorMessage.value = 'Error de conexión con el servidor';
  }
};

onMounted(fetchObjetoGastos);
</script>

<style scoped>
.d-flex {
  display: flex;
}

.container-fluid {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.card {
  border-radius: 8px;
  padding: 1rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.gradient-blue {
  background: linear-gradient(to right, #007bff, #0056b3);
}
</style>

<template>
  <div class="d-flex">
    <Navbar />
    <div class="container-fluid">
      <div class="card flex-grow-1 ms-3">
        <div class="justify-content-between align-items-center mb-3">
          <h3>Lista de Objetos de Gasto</h3>
          <router-link to="/clasificadores/objetos_gasto/form" class="btn btn-primary">
            Crear nuevo
          </router-link>
        </div>

        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class="gradient-blue text-white">ID</th>
              <th class="gradient-blue text-white">Código</th>
              <th class="gradient-blue text-white">Nombre</th>
              <th class="gradient-blue text-white">Descripción</th>
              <th class="gradient-blue text-white">Activo</th>
              <th class="gradient-blue text-white">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="objeto in objetosGasto" :key="objeto.id">
              <td>{{ objeto.id }}</td>
              <td>{{ objeto.codigo }}</td>
              <td>{{ objeto.nombre }}</td>
              <td>{{ objeto.descripcion }}</td>
              <td>{{ objeto.esta_activo ? 'Sí' : 'No' }}</td>
              <td>
                <router-link
                  :to="`/clasificadores/objetos_gasto/form/${objeto.id}`"
                  class="btn btn-sm btn-primary me-2"
                >
                  Editar
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>