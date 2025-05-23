<!-- filepath: c:\Users\HP\OneDrive\Documentos\GPA_SOFTWARE_ACTUALIZADO\software-gpa\gpa_frontend\src\views\clasificadores\Presupuesto\EjecucionPresupuestoView.vue -->
<template>
  <div class="d-flex">
    <!-- Menú de navegación -->
    <Navbar />

    <!-- Contenedor principal -->
    <div class="container-fluid d-flex">
      <!-- Tabla para mostrar la ejecución de presupuesto -->
      <div class="card flex-grow-1 ms-3">
        <h3>Lista de Ejecución de Presupuesto</h3>
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class = "gradient-blue text-white">ID</th>
              <th class = "gradient-blue text-white">Monto</th>
              <th class = "gradient-blue text-white">Fecha de Ejecución</th>
              <th class = "gradient-blue text-white">Presupuesto ID</th>
              <th class = "gradient-blue text-white">Detalle Transacción ID</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ejecucion in ejecucionesPresupuesto" :key="ejecucion.id">
              <td>{{ ejecucion.id }}</td>
              <td>{{ ejecucion.monto }}</td>
              <td>{{ ejecucion.fecha_ejecucion }}</td>
              <td>{{ ejecucion.presupuesto_id }}</td>
              <td>{{ ejecucion.detalle_transaccion_id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/views/components/NavBar.vue';
import { ref } from 'vue';

// Datos ficticios
const ejecucionesPresupuesto = ref([
  { id: 1, monto: 5000.00, fecha_ejecucion: '2025-05-01', presupuesto_id: 101, detalle_transaccion_id: 201 },
  { id: 2, monto: 12000.50, fecha_ejecucion: '2025-05-05', presupuesto_id: 102, detalle_transaccion_id: 202 },
  { id: 3, monto: 7500.75, fecha_ejecucion: '2025-05-10', presupuesto_id: 103, detalle_transaccion_id: 203 },
  { id: 4, monto: 3000.00, fecha_ejecucion: '2025-05-15', presupuesto_id: 104, detalle_transaccion_id: 204 },
  { id: 5, monto: 15000.00, fecha_ejecucion: '2025-05-20', presupuesto_id: 105, detalle_transaccion_id: 205 },
]);
</script>

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

.table th, .table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.table th {
  background-color: #f4f4f4;
}
</style>