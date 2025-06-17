<script setup>
import Navbar from '@/views/components/NavBar.vue';
import { ref, onMounted } from 'vue';
import global_vars from '@/config/global_vars';

const comparaciones = ref([]);
const errorMessage = ref('');

const fetchComparaciones = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/ejecucion_presupuesto`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message || 'Error al obtener los datos';
      return;
    }
    comparaciones.value = data;
  } catch (error) {
    console.error('Error al obtener comparaciones:', error);
    errorMessage.value = 'Error del servidor';
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value);
};

onMounted(fetchComparaciones);
</script>

<template>
  <div class="d-flex">
    <Navbar />

    <div class="container-fluid d-flex">
      <div class="card flex-grow-1 ms-3 p-3">
        <h3 class="mb-3">Comparación de Presupuesto por Periodo y Objeto de Gasto</h3>

        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class="gradient-blue text-white">Periodo Fiscal</th>
              <th class="gradient-blue text-white">Objeto de Gasto</th>
              <th class="gradient-blue text-white">Monto Planificado</th>
              <th class="gradient-blue text-white">Monto Ejecutado</th>
              <th class="gradient-blue text-white">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in comparaciones" :key="item.presupuestoId">
              <td>{{ item.periodo_fiscal }}</td>
              <td>{{ item.objetoGasto }}</td>
              <td>{{ formatCurrency(item.montoPlanificado) }}</td>
              <td>{{ formatCurrency(item.montoEjecutado) }}</td>
              <td :class="item.diferencia < 0 ? 'text-danger' : 'text-success'">
                {{ formatCurrency(item.diferencia) }}
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
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
</style>
