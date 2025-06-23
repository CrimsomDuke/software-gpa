<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';


// Variables reactivas
const libroMayor = ref([]);
const loading = ref(false);
const error = ref(null);
const cuentaSeleccionada = ref(1); // ID de cuenta


// Obtener datos del libro mayor desde el backend
const fetchLibroMayor = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3000/informe/libro_mayor?cuenta_id=1&periodo_fiscal_id=1');

    if (!response.ok) {
      throw new Error('No se pudo obtener el informe.');
    }
    const data = await response.json();
    libroMayor.value = data;
  } catch (err) {
    error.value = err.message || 'Error al obtener el informe.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLibroMayor);
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Libro Mayor</h2>
      <div class="card">
        <div class="card-header gradient-blue text-white">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h4 class="mb-0 text-white">Cuenta ID: {{ cuentaSeleccionada }}</h4>
            </div>
            <div class="col-md-6 text-end">
              <span class="badge bg-light text-dark fs-6">
                Saldo actual: ${{ libroMayor.length ? libroMayor[libroMayor.length - 1].saldo : '0.00' }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Seleccionar cuenta:</label>
            <select class="form-select" v-model="cuentaSeleccionada" @change="fetchLibroMayor">
              <option value="1">1.1.1.1 - Caja General</option>
              <option value="2">1.1.1.2 - Banco Principal</option>
            </select>
          </div>

          <div v-if="loading" class="alert alert-info">Cargando datos...</div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <table v-if="!loading && !error" class="table table-striped">
            <thead class="gradient-blue text-white">
              <tr>
                <th class="text-center">Fecha</th>
                <th class="text-center">Referencia</th>
                <th>Descripción</th>
                <th class="text-end">Debe</th>
                <th class="text-end">Haber</th>
                <th class="text-end">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in libroMayor" :key="item.referencia + item.fecha">
                <td class="text-center">{{ new Date(item.fecha).toLocaleDateString() }}</td>
                <td class="text-center">{{ item.referencia }}</td>
                <td>{{ item.descripcion_transaccion }}</td>
                <td class="text-end text-success">{{ item.debito }}</td>
                <td class="text-end text-danger">{{ item.credito }}</td>
                <td class="text-end fw-bold">{{ item.saldo }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>