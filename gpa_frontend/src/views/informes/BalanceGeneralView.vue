<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import NavBar from '../components/NavBar.vue';

// Variables reactivas
const balanceDetalles = ref([]);
const loading = ref(false);
const error = ref(null);
// Establece la fecha de corte por defecto al día de hoy
const fechaCorte = ref(new Date().toISOString().split('T')[0]);

// --- FUNCIÓN PARA EXPORTAR ---
const exportarInforme = (formato) => {
  if (balanceDetalles.value.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }
  const url = `http://localhost:3000/informe/balance_general?fecha_corte=${fechaCorte.value}&formato=${formato}`;
  window.open(url, '_blank');
};

// --- FUNCIÓN PARA OBTENER DATOS ---
const fetchBalanceGeneral = async () => {
  loading.value = true;
  error.value = null;
  balanceDetalles.value = [];
  try {
    const response = await fetch(`http://localhost:3000/informe/balance_general?fecha_corte=${fechaCorte.value}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener el Balance General');
    }
    // El backend devuelve un array plano, lo guardamos
    balanceDetalles.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// --- PROPIEDADES COMPUTADAS PARA CALCULAR TOTALES Y FILTRAR ---
// Esto hace que el componente sea más limpio y la lógica esté centralizada.

// Filtra las cuentas de Activo
const activos = computed(() => balanceDetalles.value.filter(c => c.tipo === 'activo'));
// Filtra las cuentas de Pasivo
const pasivos = computed(() => balanceDetalles.value.filter(c => c.tipo === 'pasivo'));
// Filtra las cuentas de Patrimonio
const patrimonio = computed(() => balanceDetalles.value.filter(c => c.tipo === 'patrimonio'));

// Calcula el total de activos
const totalActivos = computed(() => activos.value.reduce((sum, item) => sum + item.saldo, 0));
// Calcula el total de pasivos
const totalPasivos = computed(() => pasivos.value.reduce((sum, item) => sum + item.saldo, 0));
// Calcula el total de patrimonio
const totalPatrimonio = computed(() => patrimonio.value.reduce((sum, item) => sum + item.saldo, 0));

// La ecuación contable: Pasivo + Patrimonio
const totalPasivoYPatrimonio = computed(() => totalPasivos.value + totalPatrimonio.value);

// Observa cambios en la fecha de corte para volver a cargar los datos
watch(fechaCorte, fetchBalanceGeneral);
onMounted(fetchBalanceGeneral);
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Balance General</h2>
      <div class="card">
        <div class="card-header gradient-blue text-white">
          <h4 class="mb-0 text-white">Estado de Situación Financiera</h4>
        </div>
        <div class="card-body">
          <!-- Fila de Filtros y Exportación -->
          <div class="row mb-4 g-3 align-items-end">
            <div class="col-md-4">
              <label for="fechaCorte" class="form-label">Fecha de Corte:</label>
              <input type="date" id="fechaCorte" class="form-control" v-model="fechaCorte" />
            </div>
            <div class="col-md-8 text-end">
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-success dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  :disabled="balanceDetalles.length === 0 || loading"
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
          </div>

          <!-- Estados de Carga y Error -->
          <div v-if="loading" class="alert alert-info text-center">Cargando...</div>
          <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>
          <div v-if="!loading && balanceDetalles.length === 0 && !error" class="alert alert-warning text-center">
            No se encontraron datos para la fecha de corte seleccionada.
          </div>

          <!-- Contenido del Balance -->
          <div v-if="!loading && balanceDetalles.length > 0" class="row">
            <!-- Columna de Activos -->
            <div class="col-lg-6 mb-4">
              <h3 class="text-primary">Activos</h3>
              <table class="table table-sm">
                <tbody>
                  <tr v-for="item in activos" :key="item.codigo">
                    <td>{{ item.codigo }} - {{ item.nombre }}</td>
                    <td class="text-end">${{ item.saldo.toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-light fw-bold">
                    <td>Total Activos</td>
                    <td class="text-end fs-5">${{ totalActivos.toFixed(2) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Columna de Pasivos y Patrimonio -->
            <div class="col-lg-6">
              <h3 class="text-danger">Pasivos</h3>
              <table class="table table-sm">
                <tbody>
                  <tr v-for="item in pasivos" :key="item.codigo">
                    <td>{{ item.codigo }} - {{ item.nombre }}</td>
                    <td class="text-end">${{ item.saldo.toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-light fw-bold">
                    <td>Total Pasivos</td>
                    <td class="text-end">${{ totalPasivos.toFixed(2) }}</td>
                  </tr>
                </tfoot>
              </table>

              <h3 class="text-success mt-4">Patrimonio</h3>
              <table class="table table-sm">
                <tbody>
                  <tr v-for="item in patrimonio" :key="item.codigo">
                    <td>{{ item.codigo }} - {{ item.nombre }}</td>
                    <td class="text-end">${{ item.saldo.toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-light fw-bold">
                    <td>Total Patrimonio</td>
                    <td class="text-end">${{ totalPatrimonio.toFixed(2) }}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Total Pasivo + Patrimonio -->
              <div class="alert mt-4" :class="totalActivos.toFixed(2) === totalPasivoYPatrimonio.toFixed(2) ? 'alert-success' : 'alert-danger'">
                <div class="d-flex justify-content-between fw-bold fs-5">
                  <span>Total Pasivo + Patrimonio</span>
                  <span>${{ totalPasivoYPatrimonio.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-blue {
  background: linear-gradient(to right, #0d6efd, #0a58ca);
}
.dropdown-item i {
    width: 20px;
}
.table-sm {
    font-size: 0.9rem;
}
</style>
