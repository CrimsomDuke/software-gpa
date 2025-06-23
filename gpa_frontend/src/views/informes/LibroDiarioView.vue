<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';

const libroDiario = ref([]);
const loading = ref(false);
const error = ref(null);
const periodoFiscalId = ref(1);

const fetchLibroDiario = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(
      `http://localhost:3000/informe/libro_diario?periodo_fiscal_id=${periodoFiscalId.value}`
    );
    if (!response.ok) throw new Error('Error al obtener el Libro Diario');
    libroDiario.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLibroDiario);
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Libro Diario</h2>
      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="alert alert-info">Cargando...</div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <table v-if="!loading && !error" class="table table-striped">
            <thead class="gradient-blue text-white">
              <tr>
                <th class="text-center">Fecha</th>
                <th class="text-center">Referencia</th>
                <th>Descripción</th>
                <th>Detalle</th>
                <th class="text-end">Debe</th>
                <th class="text-end">Haber</th>
                <th class="text-center">Usuario</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in libroDiario" :key="entry.referencia + entry.descripcion_detalle + entry.fecha">
                <td class="text-center">{{ new Date(entry.fecha).toLocaleDateString() }}</td>
                <td class="text-center">{{ entry.referencia }}</td>
                <td>{{ entry.descripcion_transaccion }}</td>
                <td>{{ entry.descripcion_detalle }}</td>
                <td class="text-end text-success">{{ entry.debito }}</td>
                <td class="text-end text-danger">{{ entry.credito }}</td>
                <td class="text-center">{{ entry.usuario }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
