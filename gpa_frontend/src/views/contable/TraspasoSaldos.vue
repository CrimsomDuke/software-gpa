<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';

// Variables reactivas
const form = ref({
  estudiante_id: '',
  periodo_origen_id: '',
  periodo_destino_id: '',
  usuario_id: sessionStorage.getItem('user_id')
});

const estudiantes = ref([]);
const periodosFiscales = ref([]);
const saldosConsultados = ref([]);
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

// Obtener estudiantes
const fetchEstudiantes = async () => {
  try {
    const response = await fetch('http://localhost:3000/personas'); // Ajusta la ruta según tu API
    if (response.ok) {
      estudiantes.value = await response.json();
    }
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
  }
};

// Obtener períodos fiscales
const fetchPeriodosFiscales = async () => {
  try {
    const response = await fetch('http://localhost:3000/periodo-fiscal'); // Ajusta la ruta según tu API
    if (response.ok) {
      periodosFiscales.value = await response.json();
    }
  } catch (error) {
    console.error('Error obteniendo períodos fiscales:', error);
  }
};

// Consultar saldos del período origen
const consultarSaldos = async () => {
  if (!form.value.estudiante_id || !form.value.periodo_origen_id) {
    error.value = 'Seleccione estudiante y período origen';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(`http://localhost:3000/transaccion/consultar-saldos/${form.value.periodo_origen_id}?estudiante_id=${form.value.estudiante_id}`);

    if (response.ok) {
      saldosConsultados.value = await response.json();
    } else {
      error.value = 'Error consultando saldos';
    }
  } catch (error) {
    error.value = 'Error de conexión';
  } finally {
    loading.value = false;
  }
};

// Realizar traspaso de saldos
const realizarTraspaso = async () => {
  if (!form.value.estudiante_id || !form.value.periodo_origen_id || !form.value.periodo_destino_id) {
    error.value = 'Complete todos los campos requeridos';
    return;
  }

  if (form.value.periodo_origen_id === form.value.periodo_destino_id) {
    error.value = 'Los períodos origen y destino deben ser diferentes';
    return;
  }

  loading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    const response = await fetch('http://localhost:3000/transaccion/traspaso-saldos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estudiante_id: form.value.estudiante_id,
        periodo_origen_id: form.value.periodo_origen_id,
        periodo_destino_id: form.value.periodo_destino_id,
        user_id: form.value.usuario_id
      })
    });

    if (response.ok) {
      const result = await response.json();
      successMessage.value = 'Traspaso de saldos realizado exitosamente';
      saldosConsultados.value = []; // Limpiar saldos consultados
      form.value.estudiante_id = '';
      form.value.periodo_origen_id = '';
      form.value.periodo_destino_id = '';
    } else {
      const errorData = await response.json();
      error.value = errorData.message || 'Error realizando el traspaso';
    }
  } catch (error) {
    error.value = 'Error de conexión';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchEstudiantes();
  fetchPeriodosFiscales();
});
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Traspaso de Saldos entre Gestiones</h2>

      <div class="card">
        <div class="card-header gradient-blue text-white">
          <h4 class="mb-0 text-white">Traspaso de Saldos por Estudiante</h4>
        </div>

        <div class="card-body">
          <!-- Alertas -->
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
          <div v-if="loading" class="alert alert-info">Procesando...</div>

          <!-- Formulario -->
          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Estudiante:</label>
                <select v-model="form.estudiante_id" class="form-select">
                  <option value="">Seleccione un estudiante</option>
                  <option v-for="estudiante in estudiantes" :key="estudiante.id" :value="estudiante.id">
                    {{ estudiante.nombre }} {{ estudiante.apellido }}
                  </option>
                </select>
              </div>
            </div>

            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Período Origen:</label>
                <select v-model="form.periodo_origen_id" class="form-select">
                  <option value="">Seleccione período origen</option>
                  <option v-for="periodo in periodosFiscales" :key="periodo.id" :value="periodo.id">
                    {{ periodo.nombre }} ({{ periodo.anio }})
                  </option>
                </select>
              </div>
            </div>

            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Período Destino:</label>
                <select v-model="form.periodo_destino_id" class="form-select">
                  <option value="">Seleccione período destino</option>
                  <option v-for="periodo in periodosFiscales" :key="periodo.id" :value="periodo.id">
                    {{ periodo.nombre }} ({{ periodo.anio }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="mb-3">
            <button @click="consultarSaldos" class="btn btn-info me-2" :disabled="loading">
              Consultar Saldos
            </button>
            <button @click="realizarTraspaso" class="btn btn-primary" :disabled="loading || saldosConsultados.length === 0">
              Realizar Traspaso
            </button>
          </div>

          <!-- Tabla de saldos consultados -->
          <div v-if="saldosConsultados.length > 0" class="mt-4">
            <h5>Saldos a Traspasar</h5>
            <table class="table table-striped">
              <thead class="gradient-blue text-white">
                <tr>
                  <th>Cuenta</th>
                  <th>Descripción</th>
                  <th class="text-end">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="saldo in saldosConsultados" :key="saldo.cuenta_id">
                  <td>{{ saldo.codigo_cuenta }}</td>
                  <td>{{ saldo.nombre_cuenta }}</td>
                  <td class="text-end">{{ saldo.saldo_final }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-blue {
  background: linear-gradient(45deg, #007bff, #0056b3);
}
</style>
