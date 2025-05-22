<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'

const periodos = ref([
  {
    id: 1,
    gestion: '2023',
    fechaInicio: '2023-01-01',
    fechaFin: '2023-12-31',
    estado: 'Cerrado',
    asientosGenerados: true
  },
  {
    id: 2,
    gestion: '2024',
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    estado: 'Abierto',
    asientosGenerados: false
  },
  {
    id: 3,
    gestion: '2025',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    estado: 'Abierto',
    asientosGenerados: false
  }
])

// Simular la generación de asientos
const generarAsientos = (id) => {
  const periodo = periodos.value.find(p => p.id === id)
  if (periodo) {
    if (periodo.asientosGenerados) {
      alert(`Los asientos ya fueron generados para la gestión ${periodo.gestion}.`)
    } else {
      // Simulación de proceso (podrías agregar animación o spinner)
      periodo.asientosGenerados = true
      alert(`Asientos generados para la gestión ${periodo.gestion}.`)
    }
  } else {
    alert('Periodo no encontrado.')
  }
}
</script>


<template>
    <div class="d-flex">
        <NavBar />
        <div class="container p-4 m-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Administración de Periodos Fiscales</h2>
            <button class="btn btn-primary btn-sm">
            <i class="bi bi-plus-circle"></i> Nuevo Periodo
            </button>
        </div>

        <div class="card">
            <div class="card-header gradient-blue text-white">
            <h5 class="mb-0">Listado de Periodos Fiscales</h5>
            </div>
            <div class="card-body p-0">
            <table class="table table-striped table-bordered m-0">
                <thead class="gradient-blue text-white">
                <tr>
                    <th>Gestión</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Estado</th>
                    <th>Asientos Generados</th>
                    <th class="text-center">Acciones</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="periodo in periodos" :key="periodo.id">
                    <td>{{ periodo.gestion }}</td>
                    <td>{{ periodo.fechaInicio }}</td>
                    <td>{{ periodo.fechaFin }}</td>
                    <td>
                    <span :class="['badge', periodo.estado === 'Abierto' ? 'bg-success' : 'bg-secondary']">
                        {{ periodo.estado }}
                    </span>
                    </td>
                    <td>
                    <span :class="['badge', periodo.asientosGenerados ? 'bg-info' : 'bg-warning']">
                        {{ periodo.asientosGenerados ? 'Sí' : 'No' }}
                    </span>
                    </td>
                    <td class="text-center">
                    <button
                        class="btn btn-sm btn-outline-primary"
                        :disabled="periodo.asientosGenerados"
                        @click="generarAsientos(periodo.id)"
                    >
                        <i class="bi bi-gear-fill"></i> Generar Asientos
                    </button>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>
        </div>
    </div>
</template>
