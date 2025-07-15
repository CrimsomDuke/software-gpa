<script setup>
import global_vars from '@/config/global_vars';
import NavBar from '@/views/components/NavBar.vue';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const transaccion = ref(null);
const errorMessage = ref('');
const successMessage = ref('');

const fetchTransaccion = async () => {
  try {
    const res = await fetch(`${global_vars.api_url}/transaccion/${route.params.id}`);
    if (!res.ok) throw new Error('No se pudo cargar la transacción');
    transaccion.value = await res.json();
  } catch (error) {
    console.error(error);
    errorMessage.value = error.message;
  }
};

const calcularTotales = () => {
  const detalles = transaccion.value?.detalles || [];
  return detalles.reduce(
    (acc, d) => {
      acc.debito += parseFloat(d.debito || 0);
      acc.credito += parseFloat(d.credito || 0);
      return acc;
    },
    { debito: 0, credito: 0 }
  );
};

const eliminarTransaccion = async () => {
  const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta transacción?');
  if (!confirmacion) return;

  try {
    const usuario_id = sessionStorage.getItem('user_id');
    const res = await fetch(`${global_vars.api_url}/transaccion/delete/${route.params.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar transacción');

    successMessage.value = 'Transacción eliminada exitosamente';
    setTimeout(() => {
      router.push('/contable/transacciones');
    }, 1000);
  } catch (err) {
    errorMessage.value = err.message;
  }
};

onMounted(() => {
  fetchTransaccion();
});
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-4">
      <h2>Detalle de Transacción</h2>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <div v-if="transaccion" class="card p-4 mb-4">
        <p><strong>Referencia:</strong> {{ transaccion.referencia }}</p>
        <p><strong>Descripción:</strong> {{ transaccion.descripcion }}</p>
        <p><strong>Fecha:</strong> {{ transaccion.fecha }}</p>
        <p><strong>Tipo:</strong> {{ transaccion.tipo_transaccion }}</p>
        <p><strong>Generado por sistema:</strong> {{ transaccion.es_generado_sistema ? 'Sí' : 'No' }}</p>
        <p><strong>Usuario:</strong> {{ transaccion.usuario?.nombre || 'Desconocido' }}</p>
        <p><strong>Periodo Fiscal:</strong> {{ transaccion.periodo_fiscal?.nombre || 'N/A' }}</p>

        <div class="table-responsive mt-4">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Cuenta ID</th>
                <th>Descripción</th>
                <th class="text-end">Débito</th>
                <th class="text-end">Crédito</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in transaccion.detalles" :key="i">
                <td>{{ d.cuenta_id }}</td>
                <td>{{ d.descripcion || '-' }}</td>
                <td class="text-end">${{ parseFloat(d.debito).toFixed(2) }}</td>
                <td class="text-end">${{ parseFloat(d.credito).toFixed(2) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colspan="2">Totales</th>
                <th class="text-end">${{ calcularTotales().debito.toFixed(2) }}</th>
                <th class="text-end">${{ calcularTotales().credito.toFixed(2) }}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="mt-3">
          <button class="btn btn-danger me-2" @click="eliminarTransaccion">
            Eliminar Transacción
          </button>
          <router-link to="/contable/transacciones" class="btn btn-secondary">Volver</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-end {
  text-align: right;
}
</style>
