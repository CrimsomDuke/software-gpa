<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';

const balance = ref(null);
const loading = ref(false);
const error = ref(null);
const fechaCorte = ref('2025-06-30');

const fetchBalanceGeneral = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(
      `http://localhost:3000/informe/balance_general?fecha_corte=${fechaCorte.value}`
    );
    if (!response.ok) throw new Error('Error al obtener el Balance General');
    balance.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBalanceGeneral);
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Balance General</h2>
      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="alert alert-info">Cargando...</div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <div v-if="balance">
            <p><strong>Activos:</strong> ${{ balance.activos }}</p>
            <p><strong>Pasivos:</strong> ${{ balance.pasivos }}</p>
            <p><strong>Patrimonio:</strong> ${{ balance.patrimonio }}</p>

            <table class="table table-striped mt-4">
              <thead class="gradient-blue text-white">
                <tr>
                  <th>Tipo</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th class="text-end">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in balance.detalles" :key="item.codigo_cuenta">
                  <td>{{ item.tipo_cuenta }}</td>
                  <td>{{ item.codigo_cuenta }}</td>
                  <td>{{ item.nombre_cuenta }}</td>
                  <td class="text-end fw-bold">{{ item.saldo }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
