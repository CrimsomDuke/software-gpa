<script setup>
import { ref, onMounted,watch} from 'vue';
import NavBar from '../components/NavBar.vue';

// Variables reactivas
const libroMayor = ref([]);
const loading = ref(false);
const error = ref(null);
const cuentaSeleccionada = ref(1); // ID de cuenta

const exportarInforme = (formato) => {
  // Verificamos que haya datos para exportar
  if (libroMayor.value.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  // Construimos la URL de descarga con los filtros actuales y el formato deseado
  const url = `http://localhost:3000/informe/libro_mayor?cuenta_id=${cuentaSeleccionada.value}&periodo_fiscal_id=1&formato=${formato}`;

  // Abrimos la URL. El backend enviará el archivo y el navegador iniciará la descarga.
  window.open(url, '_blank');
};

// Obtener datos del libro mayor desde el backend
const fetchLibroMayor = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Usa el ID de cuenta seleccionado dinámicamente
    const response = await fetch(`http://localhost:3000/informe/libro_mayor?cuenta_id=${cuentaSeleccionada.value}&periodo_fiscal_id=1`);
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

// Llama a fetchLibroMayor cuando cambia la cuenta seleccionada
onMounted(fetchLibroMayor);
watch(cuentaSeleccionada, fetchLibroMayor);
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
          <div class="row mb-3 align-items-end">
            <!-- Selector de cuenta -->
            <div class="col-md-6">
              <label class="form-label">Seleccionar cuenta:</label>
              <select class="form-select" v-model="cuentaSeleccionada">
                <option value="1">1.1.1.1 - Caja General</option>
                <option value="2">1.1.1.2 - Banco Principal</option>
                <!-- Puedes cargar estas opciones dinámicamente si lo necesitas -->
              </select>
            </div>
            <!-- Botón de exportación -->
            <div class="col-md-6 text-end">
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-success dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  :disabled="libroMayor.length === 0 || loading"
                >
                  <i class="fas fa-download me-2"></i>Exportar
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" @click.prevent="exportarInforme('xlsx')">
                    <i class="fas fa-file-excel text-success me-2"></i>Exportar a Excel (.xlsx)
                  </a></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="exportarInforme('pdf')">
                    <i class="fas fa-file-pdf text-danger me-2"></i>Exportar a PDF
                  </a></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="exportarInforme('html')">
                    <i class="fab fa-html5 text-primary me-2"></i>Exportar a HTML
                  </a></li>
                </ul>
              </div>
            </div>
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
