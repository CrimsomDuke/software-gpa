<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';

const libroDiario = ref([]);
const loading = ref(false);
const error = ref(null);
const periodoFiscalId = ref(1);

const fechaInicio = ref(''); // e.g., '2025-01-01'
const fechaFin = ref('');    // e.g., '2025-01-31'

// --- FUNCIÓN PARA EXPORTAR ---
const exportarInforme = (formato) => {
  if (libroDiario.value.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  // Construye la URL base
  let url = `http://localhost:3000/informe/libro_diario?periodo_fiscal_id=${periodoFiscalId.value}`;

  // Añade los filtros de fecha si están presentes
  if (fechaInicio.value && fechaFin.value) {
    url += `&fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}`;
  }

  // Añade el formato de exportación
  url += `&formato=${formato}`;

  // Abre la URL para iniciar la descarga
  window.open(url, '_blank');
};

// --- FUNCIÓN PARA OBTENER DATOS ---
const fetchLibroDiario = async () => {
  loading.value = true;
  error.value = null;
  libroDiario.value = [];

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

          <div class="col-md-3 text-end">
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-success dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  :disabled="libroDiario.length === 0 || loading"
                >
                  <i class="fas fa-download me-2"></i>Exportar
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" @click.prevent="exportarInforme('xlsx')"><i class="fas fa-file-excel text-success me-2"></i>Excel (.xlsx)</a></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="exportarInforme('pdf')"><i class="fas fa-file-pdf text-danger me-2"></i>PDF</a></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="exportarInforme('html')"><i class="fab fa-html5 text-primary me-2"></i>HTML</a></li>
                </ul>
              </div>
            </div>

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
