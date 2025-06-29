<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'

const router = useRouter()

const message = ref({ text: '', type: '' });

const transacciones = ref([])

const showMessage = (text, type = 'info') => {
  message.value = { text, type };
  setTimeout(() => {
    message.value = { text: '', type: '' };
  }, 3000);
};

const cargarTransacciones = async () => {
  try {
    const response = await fetch('http://localhost:3000/transaccion');
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    transacciones.value = data;
  } catch (error) {
    console.error('Error cargando transacciones:', error);
    showMessage('Ocurrió un error al cargar las transacciones. Revisa la consola.', 'error');
  }
};


const nuevaTransaccion = () => {
  router.push('/contable/transacciones/nueva');
};

onMounted(() => {
  cargarTransacciones();
});
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Transacciones Contables</h2>
          <button @click="nuevaTransaccion" class="btn btn-primary rounded">
            <i class="bi bi-plus-circle"></i> Nueva Transacción
          </button>
        </div>

        <div v-if="message.text" :class="['alert', message.type === 'success' ? 'alert-success' : 'alert-danger', 'mb-4', 'rounded']" role="alert">
          {{ message.text }}
        </div>

        <div class="card overflow-card rounded">
          <div class="card-header gradient-blue text-white rounded-top">
            <h5 class="mb-0">Historial de Transacciones</h5>
          </div>
          <div class="card-body overflow-content p-0">
            <div class="table-responsive">
              <table class="table table-bordered mb-0">
                <thead class="gradient-blue text-white">
                  <tr>
                    <th>Referencia</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in transacciones" :key="t.id">
                    <td>{{ t.referencia }}</td>
                    <td>{{ t.tipo_transaccion }}</td>
                    <td>{{ t.descripcion }}</td>
                    <td>{{ t.fecha }}</td>
                  </tr>
                  <tr v-if="transacciones.length === 0">
                    <td colspan="7" class="text-center text-muted">No hay transacciones registradas</td>
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

<style scoped>
.gradient-blue {
  background: linear-gradient(45deg, #0d6efd, #02b6ff);
}

.text-white {
  color: white !important;
}

.d-flex {
  display: flex;
}

.container {
  flex-grow: 1;
}

.overflow-card {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.overflow-content {
  overflow-y: auto;
  flex-grow: 1;
}

.table thead th {
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 1;
}


.alert-success {
  background-color: #d4edda;
  border-color: #badbcc;
  color: #155724;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
}

.rounded {
  border-radius: 0.5rem !important;
}
.rounded-top {
  border-top-left-radius: 0.5rem !important;
  border-top-right-radius: 0.5rem !important;
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
</style>
