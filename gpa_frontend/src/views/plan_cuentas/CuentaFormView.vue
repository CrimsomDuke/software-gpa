<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import global_vars from '@/config/global_vars';
import NavBar from '@/views/components/NavBar.vue';

const route = useRoute();
const router = useRouter();

const cuenta_id = route.params.id;
const user_id = sessionStorage.getItem('user_id');

const form = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  tipo_cuenta_id: '',
  nivel_cuenta_id: '',
  cuenta_padre_id: null,
  objeto_gasto_id: '',
  esta_activa: true,
  user_id: user_id
});

const errorMessage = ref('');
const tiposCuenta = ref([]);
const nivelesCuenta = ref([]);
const cuentas = ref([]);
const objetoGastos = ref([]);

const validateForm = () => {
  if (!form.value.codigo || !form.value.nombre || !form.value.tipo_cuenta_id || !form.value.nivel_cuenta_id || !form.value.objeto_gasto_id) {
    errorMessage.value = 'Por favor, complete todos los campos obligatorios.';
    return false;
  }
  return true;
};

const fetchCatalogos = async () => {
  const [tiposRes, nivelesRes, cuentasRes, objetoGastoRes] = await Promise.all([
    fetch(`${global_vars.api_url}/tipo_cuenta`),
    fetch(`${global_vars.api_url}/nivel_cuenta`),
    fetch(`${global_vars.api_url}/cuenta`),
    fetch(`${global_vars.api_url}/objeto_gasto`),
  ]);

  tiposCuenta.value = await tiposRes.json();
  nivelesCuenta.value = await nivelesRes.json();
  cuentas.value = await cuentasRes.json();
  objetoGastos.value = await objetoGastoRes.json();
};

const fetchCuenta = async () => {
  const response = await fetch(`${global_vars.api_url}/cuenta/${cuenta_id}`);
  const data = await response.json();
  if (response.ok) {
    Object.assign(form.value, data);
  } else {
    errorMessage.value = data.message;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  const method = cuenta_id ? 'PUT' : 'POST';
  const url = cuenta_id
    ? `${global_vars.api_url}/cuenta/update/${cuenta_id}`
    : `${global_vars.api_url}/cuenta/create`;

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    const data = await response.json();
    if (response.ok) {
      router.push('/plan_cuentas/cuentas');
    } else {
      errorMessage.value = data.message;
    }
  } catch (error) {
    errorMessage.value = 'Error de red al guardar la cuenta';
    console.error(error);
  }
};

const handleDelete = async () => {
  if (!confirm('¿Desea eliminar esta cuenta?')) return;
  try {
    const response = await fetch(`${global_vars.api_url}/cuenta/delete/${cuenta_id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id })
    });
    const data = await response.json();
    if (response.ok) {
      router.push('/plan_cuentas/cuentas');
    } else {
      errorMessage.value = data.message;
    }
  } catch (err) {
    errorMessage.value = 'Error al eliminar la cuenta';
    console.error(err);
  }
};

onMounted(async () => {
  await fetchCatalogos();
  if (cuenta_id) await fetchCuenta();
});
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div class="card p-3">
        <router-link to="/plan_cuentas/cuentas" class="btn btn-secondary mb-3">Volver</router-link>
        <h2>{{ cuenta_id ? 'Editar' : 'Crear' }} Cuenta</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Código</label>
            <input v-model="form.codigo" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.nombre" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <input v-model="form.descripcion" class="form-control" />
          </div>
          <div class="form-group">
            <label>Tipo de Cuenta</label>
            <select v-model="form.tipo_cuenta_id" class="form-control" required>
              <option v-for="t in tiposCuenta" :key="t.id" :value="t.id">{{ t.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nivel de Cuenta</label>
            <select v-model="form.nivel_cuenta_id" class="form-control" required>
              <option v-for="n in nivelesCuenta" :key="n.id" :value="n.id">{{ n.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cuenta Padre</label>
            <select v-model="form.cuenta_padre_id" class="form-control">
              <option value="">-- Sin cuenta padre --</option>
              <option v-for="c in cuentas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Objeto de Gasto</label>
            <select v-model="form.objeto_gasto_id" class="form-control">
              <option value="">-- Sin cuenta padre --</option>
              <option v-for="c in objetoGastos" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div class="form-check my-2">
            <input v-model="form.esta_activa" type="checkbox" class="form-check-input" id="activaCheck">
            <label for="activaCheck" class="form-check-label">¿Activa?</label>
          </div>
          <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-success" type="submit">Guardar</button>
            <button v-if="cuenta_id" class="btn btn-danger" type="button" @click="handleDelete">Eliminar</button>
          </div>
        </form>
        <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}
</style>
