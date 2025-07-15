<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';

const periodos = ref([]);
const periodoAnterior = ref(null);
const periodoActual = ref(null);
const saldos = ref([]);
const loading = ref(false);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/periodo_fiscal');
    const data = await res.json();
    periodos.value = data.data;
  } catch (err) {
    error.value = 'Error al cargar los periodos fiscales';
    console.error(err);
  }
});

const consultarSaldos = async () => {
  if (!periodoAnterior.value || !periodoActual.value) {
    error.value = 'Selecciona ambos periodos fiscales';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `http://localhost:3000/periodo_fiscal/${periodoActual.value}/saldos?anteriorId=${periodoAnterior.value}`
    );
    if (!response.ok) throw new Error('Error al obtener los saldos');
    const data = await response.json();
    saldos.value = data.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Saldos entre Periodos Fiscales</h2>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row">
            <div class="col-md-5">
              <label class="form-label">Periodo Anterior</label>
              <select v-model="periodoAnterior" class="form-select">
                <option :value="null">Seleccione</option>
                <option v-for="p in periodos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
              </select>
            </div>
            <div class="col-md-5">
              <label class="form-label">Periodo Actual</label>
              <select v-model="periodoActual" class="form-select">
                <option :value="null">Seleccione</option>
                <option v-for="p in periodos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
              </select>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button @click="consultarSaldos" class="btn btn-primary w-100">Consultar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="alert alert-info">Cargando...</div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <div v-if="saldos.length > 0">
            <table class="table table-striped mt-3">
              <thead class="gradient-blue text-white">
                <tr>
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th class="text-end">Saldo Anterior</th>
                  <th class="text-end">Saldo Actual</th>
                  <th class="text-end">Saldo Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in saldos" :key="s.cuenta_id">
                  <td>{{ s.codigo }}</td>
                  <td>{{ s.nombre }}</td>
                  <td class="text-end">{{ s.saldo_anterior.toFixed(2) }}</td>
                  <td class="text-end">{{ s.saldo_actual.toFixed(2) }}</td>
                  <td class="text-end fw-bold">{{ s.saldo_total.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="!loading && saldos.length === 0" class="text-muted">No hay datos para mostrar.</div>
        </div>
      </div>
    </div>
  </div>
</template>
