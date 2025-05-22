<script setup>
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'

// Datos estáticos iniciales
const transacciones = ref([
  {
    tipo: 'Ingreso',
    descripcion: 'Pago de cliente',
    monto: 1500.00,
    fecha: '2025-05-01'
  },
  {
    tipo: 'Egreso',
    descripcion: 'Compra de insumos',
    monto: 400.00,
    fecha: '2025-05-05'
  },
  {
    tipo: 'Traspaso',
    descripcion: 'Transferencia a ahorro',
    monto: 300.00,
    fecha: '2025-05-10'
  }
])

// Modelo para la nueva transacción
const nueva = ref({
  tipo: 'Ingreso',
  descripcion: '',
  monto: null,
  fecha: ''
})

// Función para agregar una nueva transacción
const agregarTransaccion = () => {
  // Validación básica
  if (!nueva.value.descripcion || nueva.value.monto === null || !nueva.value.fecha) {
    alert('Por favor, completa todos los campos.')
    return
  }

  // Agregar al listado
  transacciones.value.push({
    tipo: nueva.value.tipo,
    descripcion: nueva.value.descripcion,
    monto: parseFloat(nueva.value.monto),
    fecha: nueva.value.fecha
  })

  // Reiniciar formulario
  nueva.value = {
    tipo: 'Ingreso',
    descripcion: '',
    monto: null,
    fecha: ''
  }
}
</script>


<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Transacciones Contables</h2>
        </div>
        <div class="card mb-4">
          <div class="card-header gradient-blue text-white">
            <h5 class="mb-0">Registrar Transacción</h5>
          </div>
          <div class="card-body">
            <form class="row g-3" @submit.prevent="agregarTransaccion">
              <div class="col-md-3">
                <label class="form-label">Tipo</label>
                <select v-model="nueva.tipo" class="form-select" required>
                  <option>Ingreso</option>
                  <option>Egreso</option>
                  <option>Traspaso</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Descripción</label>
                <input v-model="nueva.descripcion" class="form-control" type="text" required />
              </div>
              <div class="col-md-2">
                <label class="form-label">Monto</label>
                <input v-model.number="nueva.monto" class="form-control" type="number" min="0" required />
              </div>
              <div class="col-md-2">
                <label class="form-label">Fecha</label>
                <input v-model="nueva.fecha" class="form-control" type="date" required />
              </div>
              <div class="col-md-1 d-flex align-items-end">
                <button type="submit" class="btn btn-success w-100">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div class="card overflow-card">
          <div class="card-header gradient-blue text-white">
            <h5 class="mb-0">Historial de Transacciones</h5>
          </div>
          <div class="card-body overflow-content p-0">
            <div class="table-responsive">
              <table class="table table-bordered mb-0">
                <thead class="gradient-blue text-white">
                  <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th class="text-end">Monto</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(t, index) in transacciones" :key="index">
                    <td>{{ t.tipo }}</td>
                    <td>{{ t.descripcion }}</td>
                    <td class="text-end">${{ t.monto.toFixed(2) }}</td>
                    <td>{{ t.fecha }}</td>
                  </tr>
                  <tr v-if="transacciones.length === 0">
                    <td colspan="4" class="text-center text-muted">No hay transacciones registradas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
