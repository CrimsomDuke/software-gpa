<script setup>
import global_vars from '@/config/global_vars';
import NavBar from '../../components/NavBar.vue';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const id = route.params.id;
const user_id = sessionStorage.getItem('user_id');

const errorMessage = ref('');
const successMessage = ref('');

const form = ref({
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  tipo_transaccion: '',
  periodo_fiscal_id: '',
  usuario_id: user_id,
  transaccion_detalles: []
});

const detalle = ref({
  cuenta_id: '',
  debito: 0,
  credito: 0,
  descripcion: ''
});

const cuentas = ref([]);
const periodosFiscales = ref([]);

const fetchCuentas = async () => {
  try {
    const res = await fetch(`http://localhost:3000/cuenta`);
    cuentas.value = await res.json();
  } catch (err) {
    console.error('Error al obtener cuentas:', err);
  }
};

const fetchPeriodosFiscales = async () => {
  try {
    const res = await fetch(`http://localhost:3000/periodo_fiscal`);
    const resp = await res.json();
    periodosFiscales.value = resp.data || [];
  } catch (err) {
    console.error('Error al obtener periodos fiscales:', err);
  }
};

const fetchTransaccion = async () => {
  if (!id) return;
  try {
    const res = await fetch(`http://localhost:3000/transaccion/${id}`);
    const data = await res.json();
    form.value = {
      descripcion: data.descripcion,
      fecha: data.fecha.split('T')[0],
      tipo_transaccion: data.tipo_transaccion,
      periodo_fiscal_id: data.periodo_fiscal_id,
      usuario_id: data.usuario_id,
      transaccion_detalles: data.transaccion_detalles || data.DetalleTransaccions || []
    };
  } catch (err) {
    errorMessage.value = 'Error al cargar transacción.';
    console.error(err);
  }
};

const getCuentaNombre = (id) => {
  const cuenta = cuentas.value.find(c => c.id === id);
  return cuenta ? `${cuenta.codigo} - ${cuenta.nombre}` : id;
};

const agregarDetalle = () => {
  const d = detalle.value;

  if (!d.cuenta_id) return errorMessage.value = 'Seleccione una cuenta.';
  if ((d.debito || 0) > 0 && (d.credito || 0) > 0)
    return errorMessage.value = 'No puede tener débito y crédito a la vez.';
  if ((d.debito || 0) === 0 && (d.credito || 0) === 0)
    return errorMessage.value = 'Ingrese un valor en débito o crédito.';

  form.value.transaccion_detalles.push({ ...d });
  detalle.value = { cuenta_id: '', debito: 0, credito: 0, descripcion: '' };
  errorMessage.value = '';
};

const eliminarDetalle = (index) => {
  form.value.transaccion_detalles.splice(index, 1);
};

const calcularTotales = () => {
  return form.value.transaccion_detalles.reduce(
    (acc, d) => {
      acc.debito += parseFloat(d.debito || 0);
      acc.credito += parseFloat(d.credito || 0);
      return acc;
    }, { debito: 0, credito: 0 }
  );
};

const validateForm = () => {
  if (!form.value.descripcion || !form.value.fecha || !form.value.tipo_transaccion || !form.value.periodo_fiscal_id)
    return errorMessage.value = 'Complete todos los campos obligatorios.';

  if (form.value.transaccion_detalles.length < 2)
    return errorMessage.value = 'Debe agregar al menos 2 detalles.';

  const { debito, credito } = calcularTotales();
  if (Math.abs(debito - credito) > 0.01)
    return errorMessage.value = 'Débito y crédito deben ser iguales.';

  return true;
};

const handleSubmit = async () => {
  errorMessage.value = '';
  if (!validateForm()) return;

  const url = id
    ? `http://localhost:3000/transaccion/update/${id}`
    : `http://localhost:3000/transaccion/create`;

  const method = id ? 'PUT' : 'POST';

  const payload = id
    ? {
        descripcion: form.value.descripcion,
        fecha: form.value.fecha,
        tipo_transaccion: form.value.tipo_transaccion,
        periodo_fiscal_id: form.value.periodo_fiscal_id,
        usuario_id: form.value.usuario_id
      }
    : form.value;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      errorMessage.value = data.message || 'Ocurrió un error.';
      return;
    }

    successMessage.value = id ? 'Transacción actualizada.' : 'Transacción creada.';
    setTimeout(() => router.push('/contable/transacciones'), 1000);
  } catch (err) {
    errorMessage.value = 'Error de conexión.';
    console.error(err);
  }
};

onMounted(() => {
  fetchCuentas();
  fetchPeriodosFiscales();
  if (id) fetchTransaccion();
});
</script>

<template>
  <main class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div class="card p-4">
        <h2>{{ id ? 'Editar' : 'Nueva' }} Transacción</h2>

        <form @submit.prevent="handleSubmit">
          <div class="row mb-3">
            <div class="col-md-6">
              <label>Descripción *</label>
              <input class="form-control" v-model="form.descripcion" required />
            </div>
            <div class="col-md-6">
              <label>Fecha *</label>
              <input type="date" class="form-control" v-model="form.fecha" required />
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-6">
              <label>Tipo de Transacción *</label>
              <select class="form-control" v-model="form.tipo_transaccion" required>
                <option value="">-Seleccione tipo-</option>
                <option v-for="tipo in global_vars.TIPOS_TRANSACCIONES" v-bind:key="tipo" :value="tipo">{{ tipo }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label>Periodo Fiscal *</label>
              <select class="form-control" v-model="form.periodo_fiscal_id" required>
                <option value="">-Seleccione período-</option>
                <option v-for="p in periodosFiscales" :key="p.id" :value="p.id">
                  {{ p.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- Solo para creación -->
          <div v-if="!id" class="border p-3 mb-3">
            <h5>Agregar Detalle</h5>
            <div class="row mb-2">
              <div class="col-md-3">
                <label>Cuenta</label>
                <select class="form-control" v-model="detalle.cuenta_id">
                  <option value="">-Seleccione-</option>
                  <option v-for="cuenta in cuentas" :key="cuenta.id" :value="cuenta.id">
                    {{ cuenta.codigo }} - {{ cuenta.nombre }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <label>Débito</label>
                <input type="number" step="0.01" class="form-control" v-model="detalle.debito" />
              </div>
              <div class="col-md-2">
                <label>Crédito</label>
                <input type="number" step="0.01" class="form-control" v-model="detalle.credito" />
              </div>
              <div class="col-md-3">
                <label>Descripción</label>
                <input type="text" class="form-control" v-model="detalle.descripcion" />
              </div>
              <div class="col-md-2">
                <label>&nbsp;</label>
                <button type="button" class="btn btn-primary w-100" @click="agregarDetalle">Agregar</button>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Descripción</th>
                  <th class="text-end">Débito</th>
                  <th class="text-end">Crédito</th>
                  <th v-if="!id">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(d, i) in form.transaccion_detalles" :key="i">
                  <td>{{ getCuentaNombre(d.cuenta_id) }}</td>
                  <td>{{ d.descripcion }}</td>
                  <td class="text-end">${{ parseFloat(d.debito || 0).toFixed(2) }}</td>
                  <td class="text-end">${{ parseFloat(d.credito || 0).toFixed(2) }}</td>
                  <td v-if="!id">
                    <button class="btn btn-sm btn-danger" @click="eliminarDetalle(i)">Eliminar</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="2">Totales</th>
                  <th class="text-end">${{ calcularTotales().debito.toFixed(2) }}</th>
                  <th class="text-end">${{ calcularTotales().credito.toFixed(2) }}</th>
                  <th v-if="!id"></th>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="mt-3">
            <button class="btn btn-success" type="submit" :disabled="Math.abs(calcularTotales().debito - calcularTotales().credito) > 0.01">
              {{ id ? 'Actualizar' : 'Crear' }}
            </button>
            <router-link to="/contable/transacciones" class="btn btn-secondary ms-2">Cancelar</router-link>
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
          <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.text-end {
  text-align: right;
}
</style>
