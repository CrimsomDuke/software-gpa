<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';

const balance = ref(null);
const loading = ref(false);
const error = ref(null);
const periodoFiscalId = ref(1); 

const fetchBalanceComprobacion = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(
      `http://localhost:3000/informe/balance_comprobacion?periodo_fiscal_id=${periodoFiscalId.value}`
    );
    if (!response.ok) throw new Error('Error al obtener balance de comprobación');
    balance.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBalanceComprobacion);
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Balance de Comprobación</h2>
      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="alert alert-info">Cargando...</div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <div v-if="balance">
            <p><strong>Total Débito:</strong> ${{ balance.total_debito }}</p>
            <p><strong>Total Crédito:</strong> ${{ balance.total_credito }}</p>
            <p><strong>¿Equilibrado?:</strong> {{ balance.equilibrado ? 'Sí' : 'No' }}</p>

            <table class="table table-striped mt-4">
              <thead class="gradient-blue text-white">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th class="text-end">Débito</th>
                  <th class="text-end">Crédito</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in balance.balance" :key="item.codigo_cuenta">
                  <td>{{ item.codigo_cuenta }}</td>
                  <td>{{ item.nombre_cuenta }}</td>
                  <td class="text-end">{{ item.total_debito }}</td>
                  <td class="text-end">{{ item.total_credito }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
