<script setup>
import { ref, onMounted } from 'vue';
import FooterView from '@/views/components/FooterView.vue';
import Navbar from '@/views/components/NavBar.vue';
import ComboBox from '@/views/components/ComboBox.vue';
import global_vars from '@/config/global_vars';

// Variables reactivas
const presupuestos = ref([]);
const nuevoPresupuesto = ref({
  monto_inicial: '',
  periodo_fiscal_id: '',
  centro_costo_id: '',
  objeto_gasto_id: '',
  cuenta_id: ''
});
const errorMessage = ref('');
const successMessage = ref('');

// Catálogos para los ComboBox
const periodosFiscales = ref([]);
const centrosCosto = ref([]);
const objetosGasto = ref([]);
const cuentas = ref([]);

// Función para obtener presupuestos
const fetchPresupuestos = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/presupuesto`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      presupuestos.value = data;
    } else {
      errorMessage.value = 'Error al obtener los presupuestos.';
    }
  } catch (error) {
    errorMessage.value = 'Error al obtener los presupuestos.';
  }
};

// Obtener períodos fiscales
const fetchPeriodosFiscales = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/periodo_fiscal`);
    const data = await response.json();
    periodosFiscales.value = data.data || data;
    // Seleccionar el primer elemento si no hay valor
    if (!nuevoPresupuesto.value.periodo_fiscal_id && periodosFiscales.value.length > 0) {
      nuevoPresupuesto.value.periodo_fiscal_id = periodosFiscales.value[0].id;
    }
  } catch (error) {
    console.error('Error al obtener periodos fiscales:', error);
  }
};

// Obtener centros de costo
const fetchCentrosCosto = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/centro_costo`);
    centrosCosto.value = await response.json();
    if (!nuevoPresupuesto.value.centro_costo_id && centrosCosto.value.length > 0) {
      nuevoPresupuesto.value.centro_costo_id = centrosCosto.value[0].id;
    }
  } catch (error) {
    console.error('Error al obtener centros de costo:', error);
  }
};

// Obtener objetos de gasto
const fetchObjetosGasto = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/objeto_gasto`);
    objetosGasto.value = await response.json();
    if (!nuevoPresupuesto.value.objeto_gasto_id && objetosGasto.value.length > 0) {
      nuevoPresupuesto.value.objeto_gasto_id = objetosGasto.value[0].id;
    }
  } catch (error) {
    console.error('Error al obtener objetos de gasto:', error);
  }
};

// Obtener cuentas
const fetchCuentas = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/cuenta`);
    cuentas.value = await response.json();
    if (!nuevoPresupuesto.value.cuenta_id && cuentas.value.length > 0) {
      nuevoPresupuesto.value.cuenta_id = cuentas.value[0].id;
    }
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
  }
};

// Función para registrar un nuevo presupuesto
const registrarPresupuesto = async () => {
  try {
    // Convertir todos los campos de ID a número antes de enviar
    const cleanNumber = (val) => {
      if (val === '' || val === null || val === undefined) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };
    // Log antes de armar el body
    console.log('Valores crudos del modelo:', { ...nuevoPresupuesto.value });
    // Obtener user_id de sessionStorage
    const user_id = Number(sessionStorage.getItem('user_id'));
    const body = {
      monto_inicial: cleanNumber(nuevoPresupuesto.value.monto_inicial),
      periodo_fiscal_id: cleanNumber(nuevoPresupuesto.value.periodo_fiscal_id),
      centro_costo_id: cleanNumber(nuevoPresupuesto.value.centro_costo_id),
      objeto_gasto_id: cleanNumber(nuevoPresupuesto.value.objeto_gasto_id),
      cuenta_id: cleanNumber(nuevoPresupuesto.value.cuenta_id),
      user_id: user_id
    };
    // LOG DETALLADO DE CADA CAMPO
    Object.entries(body).forEach(([k, v]) => {
      console.log(`Campo: ${k}, Valor:`, v, ', Tipo:', typeof v);
      if (v === null) {
        alert(`El campo ${k} está vacío o es inválido. Por favor selecciona un valor.`);
      }
    });
    console.log('Payload final enviado al backend:', body);
    const response = await fetch(`${global_vars.api_url}/presupuesto/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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
        cuenta_id: ''
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
onMounted(() => {
  fetchPresupuestos();
  fetchPeriodosFiscales();
  fetchCentrosCosto();
  fetchObjetosGasto();
  fetchCuentas();
});
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
            <label for="periodo_fiscal_id">Período Fiscal:</label>
            <ComboBox
              :dataSource="periodosFiscales"
              valueField="id"
              textField="nombre"
              v-model="nuevoPresupuesto.periodo_fiscal_id"
              :defaultValue="nuevoPresupuesto.periodo_fiscal_id"
              :disabled="false"
            />
          </div>
          <div>
            <label for="centro_costo_id">Centro de Costo:</label>
            <ComboBox
              :dataSource="centrosCosto"
              valueField="id"
              textField="nombre"
              v-model="nuevoPresupuesto.centro_costo_id"
              :defaultValue="nuevoPresupuesto.centro_costo_id"
              :disabled="false"
            />
          </div>
          <div>
            <label for="objeto_gasto_id">Objeto de Gasto:</label>
            <ComboBox
              :dataSource="objetosGasto"
              valueField="id"
              textField="nombre"
              v-model="nuevoPresupuesto.objeto_gasto_id"
              :defaultValue="nuevoPresupuesto.objeto_gasto_id"
              :disabled="false"
            />
          </div>
          <div>
            <label for="cuenta_id">Cuenta:</label>
            <ComboBox
              :dataSource="cuentas"
              valueField="id"
              textField="nombre"
              v-model="nuevoPresupuesto.cuenta_id"
              :defaultValue="nuevoPresupuesto.cuenta_id"
              :disabled="false"
            />
          </div>
          <!-- El campo de usuario ya no se muestra, se toma de sessionStorage -->
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
              <td>{{ presupuesto.cuenta?.nombre || presupuesto.cuenta_id }}</td>
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