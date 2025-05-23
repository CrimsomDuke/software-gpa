
<template>
  <div class="d-flex">
    <!-- Menú de navegación -->
    <Navbar />

    <!-- Contenedor principal -->
    <div class="container-fluid d-flex">
      <!-- Tabla para mostrar los centros de costo -->
      <div class="card flex-grow-1 ms-3">
        <h3>Lista de Centros de Costo</h3>
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
            <tr v-for="centro in centrosCosto" :key="centro.id">
              <td>{{ centro.id }}</td>
              <td>{{ centro.codigo }}</td>
              <td>{{ centro.nombre }}</td>
              <td>{{ centro.descripcion }}</td>
              <td>{{ centro.esta_activo ? 'Sí' : 'No' }}</td>
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
const centrosCosto = ref([
  { id: 1, codigo: 'CC001', nombre: 'Administración', descripcion: 'Centro de costo para administración', esta_activo: true },
  { id: 2, codigo: 'CC002', nombre: 'Producción', descripcion: 'Centro de costo para producción', esta_activo: true },
  { id: 3, codigo: 'CC003', nombre: 'Ventas', descripcion: 'Centro de costo para ventas', esta_activo: false },
  { id: 4, codigo: 'CC004', nombre: 'Logística', descripcion: 'Centro de costo para logística', esta_activo: true },
  { id: 5, codigo: 'CC005', nombre: 'Recursos Humanos', descripcion: 'Centro de costo para recursos humanos', esta_activo: true },
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