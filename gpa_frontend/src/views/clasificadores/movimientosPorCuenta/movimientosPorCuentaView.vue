<script setup>
import { ref, watch, onMounted } from 'vue';
import NavBar from '@/views/components/NavBar.vue';
import global_vars from '@/config/global_vars';

const cuentas = ref([]);
const cuentaSeleccionada = ref(null);
const movimientos = ref([]);
const loading = ref(false);
const errorMessage = ref('');

// Traer todas las cuentas
const fetchCuentas = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/cuenta`);
    if (!response.ok) throw new Error('Error al obtener cuentas');
    cuentas.value = await response.json();
  } catch (err) {
    console.error(err);
    errorMessage.value = 'Error cargando las cuentas contables';
  }
};

// Traer los movimientos de la cuenta seleccionada
const fetchMovimientosPorCuenta = async () => {
  if (!cuentaSeleccionada.value) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(`${global_vars.api_url}/cuentas/${cuentaSeleccionada.value}/movimientos`);
    if (!response.ok) throw new Error('Error al obtener movimientos');

    movimientos.value = await response.json();
  } catch (err) {
    console.error(err);
    errorMessage.value = 'Error cargando los movimientos por cuenta';
    movimientos.value = [];
  } finally {
    loading.value = false;
  }
};

// Cuando cambia la cuenta, se actualiza automáticamente
watch(cuentaSeleccionada, fetchMovimientosPorCuenta);

onMounted(fetchCuentas);
</script>

<template>
  <div class="d-flex">
    <NavBar />

    <div class="container-fluid d-flex">
      <div class="card flex-grow-1 ms-3">
        <h3>Movimientos por Cuenta</h3>

        <div class="mb-3">
          <label for="cuentaSelect" class="form-label">Selecciona una cuenta:</label>
          <select v-model="cuentaSeleccionada" id="cuentaSelect" class="form-select">
            <option disabled value="">-- Selecciona una cuenta --</option>
            <option v-for="cuenta in cuentas" :key="cuenta.id" :value="cuenta.id">
              {{ cuenta.codigo }} - {{ cuenta.nombre }}
            </option>
          </select>
        </div>

        <div v-if="errorMessage" class="text-danger">{{ errorMessage }}</div>

        <div v-else-if="loading">
          <p>Cargando movimientos...</p>
        </div>

        <table v-else-if="movimientos.length > 0" class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class="gradient-blue text-white">ID</th>
              <th class="gradient-blue text-white">Cuenta</th>
              <th class="gradient-blue text-white">Descripción</th>
              <th class="gradient-blue text-white">Débito</th>
              <th class="gradient-blue text-white">Crédito</th>
              <th class="gradient-blue text-white">Fecha Transacción</th>
              <th class="gradient-blue text-white">Descripción Transacción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mov in movimientos" :key="mov.id">
              <td>{{ mov.id }}</td>
              <td>{{ mov.cuenta?.nombre || '—' }}</td>
              <td>{{ mov.descripcion }}</td>
              <td>{{ mov.debito }}</td>
              <td>{{ mov.credito }}</td>
              <td>{{ mov.transaccion?.fecha || '—' }}</td>
              <td>{{ mov.transaccion?.descripcion || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else>
          <p class="text-muted">No hay movimientos para esta cuenta.</p>
        </div>
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

.gradient-blue {
  background: linear-gradient(to right, #007bff, #0056b3);
}

.form-select {
  max-width: 400px;
}
</style>
