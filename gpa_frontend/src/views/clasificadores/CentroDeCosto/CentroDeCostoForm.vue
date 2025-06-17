<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '@/views/components/NavBar.vue';
import global_vars from '@/config/global_vars';

const route = useRoute();
const router = useRouter();

const user_id = sessionStorage.getItem('user_id');
const centro_costo_id = route.params.id;

const form = ref({
  nombre: '',
  descripcion: '',
  codigo: '',
  esta_activo: true,
  user_id: user_id
});

const errorMessage = ref('');

const validateForm = () => {
  if (!form.value.nombre) {
    errorMessage.value = 'El nombre es requerido';
    return false;
  }
  if (!form.value.descripcion) {
    errorMessage.value = 'La descripción es requerida';
    return false;
  }
  if (!form.value.codigo) {
    errorMessage.value = 'El código es requerido';
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  if (centro_costo_id) {
    await handleUpdate();
  } else {
    await handleCreate();
  }

  if (!errorMessage.value) {
    router.push('/clasificadores/centros_costo');
  }
};

const handleCreate = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/centro_costo/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message;
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Error al crear centro de costo';
  }
};

const handleUpdate = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/centro_costo/update/${centro_costo_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message;
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Error al actualizar centro de costo';
  }
};

const handleDelete = async () => {
  if (!confirm('¿Está seguro de que desea eliminar este centro de costo?')) return;

  try {
    const response = await fetch(`${global_vars.api_url}/centro_costo/delete/${centro_costo_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id })
    });

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message;
    } else {
      router.push('/clasificadores/centros_costo');
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Error al eliminar centro de costo';
  }
};

const fetchCentroCosto = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/centro_costo/${centro_costo_id}`);
    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message;
    } else {
      form.value.nombre = data.nombre;
      form.value.descripcion = data.descripcion;
      form.value.codigo = data.codigo;
      form.value.esta_activo = data.esta_activo;
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Error al cargar centro de costo';
  }
};

if (centro_costo_id) {
  onMounted(fetchCentroCosto);
}
</script>


<template>
  <main class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div class="card p-3">
        <div>
          <router-link to="/clasificadores/centros_costo" class="btn btn-secondary">Volver atrás</router-link>
        </div>
        <h2>Formulario Centro de Costo</h2>
        <form class="form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="control-label">Nombre:</label>
            <input v-model="form.nombre" type="text" class="form-control" required />
          </div>

          <div class="form-group">
            <label class="control-label">Descripción:</label>
            <input v-model="form.descripcion" type="text" class="form-control" required />
          </div>

          <div class="form-group">
            <label class="control-label">Código:</label>
            <input v-model="form.codigo" type="text" class="form-control" required />
          </div>

          <input v-model="form.user_id" type="hidden" />

          <div class="container p-3 w-100 d-flex justify-content-between">
            <button class="btn btn-success" type="submit">Guardar</button>
            <button v-if="route.params.id" class="btn btn-danger" type="button" @click="handleDelete">
              Eliminar
            </button>
          </div>
        </form>

        <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
      </div>
    </div>
  </main>
</template>
