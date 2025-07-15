<script setup>
import { ref, onMounted, watch } from 'vue';
import NavBar from '../components/NavBar.vue';

// Variables reactivas
const balanceData = ref(null); // Almacenará el objeto completo { balance, total_debito, ... }
const loading = ref(false);
const error = ref(null);

// Filtros
const periodoFiscalId = ref(1);
const fechaInicio = ref('');
const fechaFin = ref('');

// --- FUNCIÓN PARA EXPORTAR ---
const exportarInforme = (formato) => {
  if (!balanceData.value || balanceData.value.balance.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  let url = `http://localhost:3000/informe/balance_comprobacion?periodo_fiscal_id=${periodoFiscalId.value}`;
  if (fechaInicio.value && fechaFin.value) {
    url += `&fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}`;
  }
  url += `&formato=${formato}`;

  window.open(url, '_blank');
};

// --- FUNCIÓN PARA OBTENER DATOS ---
const fetchBalanceComprobacion = async () => {
  loading.value = true;
  error.value = null;
  balanceData.value = null;

  try {
    let url = `http://localhost:3000/informe/balance_comprobacion?periodo_fiscal_id=${periodoFiscalId.value}`;
    if (fechaInicio.value && fechaFin.value) {
      url += `&fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener balance de comprobación');
    }
    balanceData.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Observadores para recargar datos cuando cambian los filtros
watch([periodoFiscalId, fechaInicio, fechaFin], fetchBalanceComprobacion);
onMounted(fetchBalanceComprobacion);
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Balance de Comprobación</h2>
      <div class="card">
        <div class="card-header gradient-blue text-white">
          <h4 class="mb-0 text-white">Verificación de Saldos</h4>
        </div>
        <div class="card-body">
          <!-- Fila de Filtros y Exportación -->
          <div class="row mb-4 g-3 align-items-end">
            <div class="col-md-3">
              <label for="periodo" class="form-label">Período Fiscal:</label>
              <select id="periodo" class="form-select" v-model="periodoFiscalId">
                <option value="1">Año 2025</option>
                <option value="2">Año 2024</option>
              </select>
            </div>
            <div class="col-md-3">
              <label for="fechaInicio" class="form-label">Desde:</label>
              <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" />
            </div>
            <div class="col-md-3">
              <label for="fechaFin" class="form-label">Hasta:</label>
              <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" />
            </div>
            <div class="col-md-3 text-end">
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-success dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  :disabled="!balanceData || balanceData.balance.length === 0 || loading"
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
          <div v-if="!loading && (!balanceData || balanceData.balance.length === 0) && !error" class="alert alert-warning text-center">
            No se encontraron datos para los filtros seleccionados.
          </div>

          <!-- Contenido del Balance de Comprobación -->
          <div v-if="!loading && balanceData && balanceData.balance.length > 0">
            <table class="table table-striped table-hover">
              <thead class="gradient-blue text-white">
                <tr>
                  <th>Código</th>
                  <th>Nombre de la Cuenta</th>
                  <th class="text-end">Débito</th>
                  <th class="text-end">Crédito</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in balanceData.balance" :key="item.codigo_cuenta">
                  <td>{{ item.codigo_cuenta }}</td>
                  <td>{{ item.nombre_cuenta }}</td>
                  <td class="text-end">${{ item.total_debito.toFixed(2) }}</td>
                  <td class="text-end">${{ item.total_credito.toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot class="table-group-divider">
                <tr class="table-light fw-bold fs-5">
                    <td colspan="2" class="text-end">Totales:</td>
                    <td class="text-end">${{ balanceData.total_debito.toFixed(2) }}</td>
                    <td class="text-end">${{ balanceData.total_credito.toFixed(2) }}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Verificación de Balance -->
            <div class="mt-4 p-3 rounded text-center" :class="balanceData.equilibrado ? 'alert alert-success' : 'alert alert-danger'">
                <h5 class="mb-0 fw-bold">
                    <i :class="balanceData.equilibrado ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    El balance está {{ balanceData.equilibrado ? 'Equilibrado' : 'Desequilibrado' }}
                </h5>
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
</style>
