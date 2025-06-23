<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';

const resultado = ref(null);
const loading = ref(false);
const error = ref(null);
const periodoFiscalId = ref(1); // ID del periodo fiscal actual

const fetchEstadoResultados = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(
      `http://localhost:3000/informe/estado_resultados?periodo_fiscal_id=${periodoFiscalId.value}`
    );
    if (!response.ok) throw new Error('Error al obtener estado de resultados');
    resultado.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchEstadoResultados);
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Estado de Resultados</h2>
      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="alert alert-info">Cargando...</div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <div v-if="resultado">
            <p><strong>Total Ingresos:</strong> ${{ resultado.ingresos }}</p>
            <p><strong>Total Egresos:</strong> ${{ resultado.egresos }}</p>
            <p><strong>Utilidad Neta:</strong> ${{ resultado.utilidad_neta }}</p>

            <table class="table table-striped mt-4">
              <thead class="gradient-blue text-white">
                <tr>
                  <th>Tipo</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th class="text-end">Débito</th>
                  <th class="text-end">Crédito</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in resultado.detalles" :key="item.codigo_cuenta">
                  <td>{{ item.tipo_cuenta }}</td>
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
