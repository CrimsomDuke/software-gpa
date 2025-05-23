
<template>
  <div class="d-flex">
    <!-- Menú de navegación -->
    <Navbar />

    <!-- Contenedor principal -->
    <div class="container-fluid d-flex">
      <!-- Tabla para mostrar los objetos de gasto -->
      <div class="card flex-grow-1 ms-3">
        <h3>Lista de Objetos de Gasto</h3>
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class = "gradient-blue text-white">ID</th>
              <th class = "gradient-blue text-white">Código</th>
              <th class = "gradient-blue text-white">Nombre</th>
              <th class = "gradient-blue text-white">Descripción</th>
              <th class = "gradient-blue text-white">Activo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="objeto in objetosGasto" :key="objeto.id">
              <td>{{ objeto.id }}</td>
              <td>{{ objeto.codigo }}</td>
              <td>{{ objeto.nombre }}</td>
              <td>{{ objeto.descripcion }}</td>
              <td>{{ objeto.esta_activo ? 'Sí' : 'No' }}</td>
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
const objetosGasto = ref([
  { id: 1, codigo: 'OG001', nombre: 'Materiales', descripcion: 'Gastos en materiales de oficina', esta_activo: true },
  { id: 2, codigo: 'OG002', nombre: 'Servicios', descripcion: 'Gastos en servicios públicos', esta_activo: true },
  { id: 3, codigo: 'OG003', nombre: 'Transporte', descripcion: 'Gastos en transporte y logística', esta_activo: false },
  { id: 4, codigo: 'OG004', nombre: 'Publicidad', descripcion: 'Gastos en campañas publicitarias', esta_activo: true },
  { id: 5, codigo: 'OG005', nombre: 'Capacitación', descripcion: 'Gastos en formación del personal', esta_activo: true },
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