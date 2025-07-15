<script setup>
import Navbar from '@/views/components/NavBar.vue';
import { ref, onMounted } from 'vue';
import global_vars from '@/config/global_vars';

const presupuestosDisponibles = ref([]);
const presupuestoSeleccionado = ref('');
const comparacionFiltrada = ref(null);
const errorMessage = ref('');

const fetchPresupuestosDisponibles = async () => {
  try {
    const res = await fetch(`${global_vars.api_url}/presupuesto`);
    const data = await res.json();
    if (res.ok) presupuestosDisponibles.value = data;
  } catch (e) {
    console.error("Error obteniendo presupuestos:", e);
  }
};

const fetchDetalle = async () => {
  comparacionFiltrada.value = null;
  errorMessage.value = '';

  if (!presupuestoSeleccionado.value) {
    errorMessage.value = 'Por favor selecciona un presupuesto para filtrar.';
    return;
  }

  try {
    const response = await fetch(`${global_vars.api_url}/ejecucion_presupuesto/${presupuestoSeleccionado.value}`);
    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message || 'Error al obtener el detalle';
      return;
    }
    comparacionFiltrada.value = data;
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    errorMessage.value = 'Error del servidor';
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value || 0);
};

onMounted(fetchPresupuestosDisponibles);
</script>

<template>
  <div class="d-flex">
    <Navbar />
    <div class="container-fluid d-flex flex-column ms-3 p-3" style="max-width: 600px;">
      <h4 class="mb-3">Filtrar Comparación Presupuestaria por Presupuesto</h4>
      <div class="d-flex gap-2 mb-3">
        <select v-model="presupuestoSeleccionado" class="form-select" style="flex-grow: 1;">
          <option value="">-- Selecciona un presupuesto --</option>
          <option v-for="p in presupuestosDisponibles" :key="p.id" :value="p.id">
            {{ p.centro_costo.nombre }} - {{ p.periodo_fiscal?.nombre }}
          </option>
        </select>
        <button class="btn btn-primary" @click="fetchDetalle">Buscar</button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div v-if="comparacionFiltrada" class="card p-3">
        <h5>Resultado</h5>
        <p><strong>Periodo Fiscal:</strong> {{ comparacionFiltrada.periodo_fiscal }}</p>
        <p><strong>Objeto de Gasto:</strong> {{ comparacionFiltrada.objetoGasto }}</p>
        <p><strong>Monto Planificado:</strong> {{ formatCurrency(comparacionFiltrada.montoPlanificado) }}</p>
        <p><strong>Monto Ejecutado:</strong> {{ formatCurrency(comparacionFiltrada.montoEjecutado) }}</p>
        <p>
          <strong>Diferencia:</strong>
          <span :class="comparacionFiltrada.diferencia < 0 ? 'text-danger' : 'text-success'">
            {{ formatCurrency(comparacionFiltrada.diferencia) }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-danger {
  color: #dc3545;
}

.text-success {
  color: #28a745;
}
</style>
