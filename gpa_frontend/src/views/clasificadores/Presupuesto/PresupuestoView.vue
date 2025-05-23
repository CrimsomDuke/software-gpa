<script setup>
import { ref, onMounted } from 'vue';
import FooterView from '@/views/components/FooterView.vue';
import Navbar from '@/views/components/NavBar.vue';
import global_vars from '@/config/global_vars';

// Variables reactivas
const presupuestos = ref([]);
const nuevoPresupuesto = ref({
  monto_inicial: '',
  periodo_fiscal_id: '',
  centro_costo_id: '',
  objeto_gasto_id: '',
  cuenta_id: '',
  user_id: ''
});
const errorMessage = ref('');
const successMessage = ref('');

// Función para obtener presupuestos
const fetchPresupuestos = async () => {
  try {
    console.log("Fetching presupuestos...");
    const response = await fetch(`${global_vars.api_url}/presupuesto`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Presupuestos fetched:", data); // Verifica los datos obtenidos
      presupuestos.value = data;
    } else {
      errorMessage.value = 'Error al obtener los presupuestos.';
      console.error('Error response:', await response.json());
    }
  } catch (error) {
    console.error('Error al obtener los presupuestos:', error);
    errorMessage.value = 'Error al obtener los presupuestos.';
  }
};

// Función para registrar un nuevo presupuesto
const registrarPresupuesto = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/presupuesto/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoPresupuesto.value)
    });

    if (response.ok) {
      const presupuesto = await response.json();
      presupuestos.value.push(presupuesto); // Agregar el nuevo presupuesto a la lista
      successMessage.value = 'Presupuesto registrado exitosamente.';
      nuevoPresupuesto.value = {
        monto_inicial: '',
        periodo_fiscal_id: '',
        centro_costo_id: '',
        objeto_gasto_id: '',
        cuenta_id: '',
        user_id: ''
      };
    } else {
      const errorData = await response.json();
      errorMessage.value = errorData.message || 'Error al registrar el presupuesto.';
    }
  } catch (error) {
    console.error('Error al registrar el presupuesto:', error);
    errorMessage.value = 'Error al registrar el presupuesto.';
  }
};

// Ejecutar la función al montar el componente
onMounted(fetchPresupuestos);
</script>

<template>
  <div class="d-flex">
    <!-- Menú de navegación -->
    <Navbar />

    <!-- Contenedor principal -->
    <div class="container-fluid d-flex">
      <!-- Formulario para registrar un nuevo presupuesto -->
      <div class="card p-3 mb-3 w-25">
        <h3>Registrar Presupuesto</h3>
        <form @submit.prevent="registrarPresupuesto">
          <div>
            <label for="monto_inicial">Monto Inicial:</label>
            <input type="number" id="monto_inicial" v-model="nuevoPresupuesto.monto_inicial" required />
          </div>
          <div>
            <label for="periodo_fiscal_id">Periodo Fiscal ID:</label>
            <input type="number" id="periodo_fiscal_id" v-model="nuevoPresupuesto.periodo_fiscal_id" required />
          </div>
          <div>
            <label for="centro_costo_id">Centro de Costo ID:</label>
            <input type="number" id="centro_costo_id" v-model="nuevoPresupuesto.centro_costo_id" required />
          </div>
          <div>
            <label for="objeto_gasto_id">Objeto de Gasto ID:</label>
            <input type="number" id="objeto_gasto_id" v-model="nuevoPresupuesto.objeto_gasto_id" required />
          </div>
          <div>
            <label for="cuenta_id">Cuenta ID:</label>
            <input type="number" id="cuenta_id" v-model="nuevoPresupuesto.cuenta_id" required />
          </div>
          <div>
            <label for="user_id">Usuario ID:</label>
            <input type="number" id="user_id" v-model="nuevoPresupuesto.user_id" required />
          </div>
          <button type="submit" class="btn btn-primary mt-2">Registrar</button>
        </form>
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
      </div>

      <!-- Tabla para mostrar los presupuestos -->
      <div class="card flex-grow-1 ms-3">
        <h3>Lista de Presupuestos</h3>
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class = "gradient-blue text-white">ID</th>
              <th class = "gradient-blue text-white">Monto Inicial</th>
              <th class = "gradient-blue text-white">Centro de Costo</th>
              <th class = "gradient-blue text-white">Objeto de Gasto</th>
              <th class = "gradient-blue text-white">Cuenta</th>
              <th class = "gradient-blue text-white">Periodo Fiscal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="presupuesto in presupuestos" :key="presupuesto.id">
              <td>{{ presupuesto.id }}</td>
              <td>{{ presupuesto.monto_inicial }}</td>
              <td>{{ presupuesto.centro_costo?.nombre || 'N/A' }}</td>
              <td>{{ presupuesto.objeto_gasto?.nombre || 'N/A' }}</td>
              <td>{{ presupuesto.cuenta_id }}</td>
              <td>{{ presupuesto.periodo_fiscal_id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <FooterView />
</template>

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
</style>