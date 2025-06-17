<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '@/views/components/NavBar.vue';
import global_vars from '@/config/global_vars';

const centrosCosto = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const fetchCentrosCosto = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/centro_costo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    centrosCosto.value = await response.json();

  } catch (err) {
    console.error(err);
    errorMessage.value = 'Error cargando los centros de costo';
  } finally {
    loading.value = false;
  }
}

// Llama al endpoint real cuando se monta el componente
onMounted(fetchCentrosCosto);
</script>

<template>
  <div class="d-flex">
    <NavBar />

    <div class="container-fluid d-flex">
      <div class="card flex-grow-1 ms-3">
        <h3>Lista de Centros de Costo</h3>

        <div>
          <router-link to="/clasificadores/centros_costo/form" class="btn btn-primary mb-3">Crear Centro de Costo</router-link>
        </div>

        <div v-if="error" class="text-danger">{{ error }}</div>
        <table v-else class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class="gradient-blue text-white">ID</th>
              <th class="gradient-blue text-white">Código</th>
              <th class="gradient-blue text-white">Nombre</th>
              <th class="gradient-blue text-white">Descripción</th>
              <th class="gradient-blue text-white">Activo</th>
              <th class="gradient-blue text-white">Editar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="centro in centrosCosto" :key="centro.id">
              <td>{{ centro.id }}</td>
              <td>{{ centro.codigo }}</td>
              <td>{{ centro.nombre }}</td>
              <td>{{ centro.descripcion }}</td>
              <td>{{ centro.esta_activo ? 'Sí' : 'No' }}</td>
              <td>
                  <router-link :to="{ name: 'CentroCostoFormEdit', params: { id: centro.id } }" class="btn btn-primary">
                    Editar
                  </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

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

.table th {
  background-color: #f4f4f4;
}

.gradient-blue {
  background: linear-gradient(to right, #007bff, #0056b3);
}
</style>
