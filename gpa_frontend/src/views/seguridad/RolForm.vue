<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import global_vars from '@/config/global_vars';

const route = useRoute();
const router = useRouter();
const roleId = route.params.id;
const user_id = sessionStorage.getItem('user_id');

const form = ref({
  name: '',
  description: '',
  level: 0,
  user_id: user_id
});

const errorMessage = ref('');

const validateForm = () => {
  if (!form.value.name) {
    errorMessage.value = 'El nombre del rol es requerido';
    return false;
  }
  if (form.value.level === null || form.value.level === undefined || isNaN(form.value.level)) {
    errorMessage.value = 'El nivel es requerido y debe ser un número';
    return false;
  }
  return true;
};

const fetchRole = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/roles/${roleId}`);
    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message;
    } else {
      form.value.name = data.name;
      form.value.description = data.description;
      form.value.level = data.level;
    }
  } catch (error) {
    console.error('Error fetching role:', error);
    errorMessage.value = 'Error cargando rol';
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  if(route.params.id){
    await handleUpdate();
  } else {
    await handleCreate();
  }

};

const handleCreate = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/roles/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message;
    } else {
      router.push('/seguridad/roles');
    }
  } catch (error) {
    console.error('Error creating role:', error);
    errorMessage.value = 'Error al crear el rol';
  }
};

const handleUpdate = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/roles/update/${roleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body : JSON.stringify(form.value)
    });

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message;
    } else {
      router.push('/seguridad/roles');
    }
  } catch (error) {
    console.error('Error updating role:', error);
    errorMessage.value = 'Error al actualizar el rol';
  }
};

const handleDelete = async () => {
  if (!confirm('¿Está seguro de que desea eliminar este rol?')) return;

  try {
    const response = await fetch(`${global_vars.api_url}/roles/delete/${roleId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id })
    });

    if (!response.ok) {
      const data = await response.json();
      errorMessage.value = data.message;
    } else {
      router.push('/seguridad/roles');
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    errorMessage.value = 'Error al eliminar el rol';
  }
};

if (roleId) {
  onMounted(fetchRole);
}
</script>

<template>
  <main class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div class="card p-4">
        <router-link to="/seguridad/roles" class="btn btn-secondary mb-3">Volver atrás</router-link>
        <h2>{{ roleId ? 'Editar Rol' : 'Nuevo Rol' }}</h2>

        <form @submit.prevent="handleSubmit">
          <div class="form-group mb-3">
            <label>Nombre del rol:</label>
            <input v-model="form.name" class="form-control" type="text" required />
          </div>

          <div class="form-group mb-3">
            <label>Descripción:</label>
            <input v-model="form.description" class="form-control" type="text" />
          </div>

          <div class="form-group mb-3">
            <label>Nivel:</label>
            <input v-model.number="form.level" class="form-control" type="number" min="0" required />
          </div>

          <input type="hidden" v-model="form.user_id" />

          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-success">Guardar</button>

            <button v-if="roleId" @click="handleDelete" type="button" class="btn btn-danger">
              Eliminar
            </button>
          </div>

          <p class="text-danger mt-2" v-if="errorMessage">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.d-flex {
  display: flex;
}
.container {
  display: flex;
  flex-direction: column;
}
.card {
  border-radius: 8px;
  padding: 1rem;
}
</style>
