<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '@/views/components/NavBar.vue';
import global_vars from '@/config/global_vars';

const router = useRouter();
const route = useRoute();

const objetoGastoId = route.params.id;
const isEditing = !!objetoGastoId;

const errorMessage = ref('');

const form = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  esta_activo: true,
  user_id: sessionStorage.getItem('user_id')
});

const validateForm = () => {
  if (!form.value.codigo || !form.value.nombre || !form.value.descripcion) {
    errorMessage.value = 'Todos los campos son obligatorios';
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  if (isEditing) {
    await updateObjetoGasto();
  } else {
    await createObjetoGasto();
  }

  if (!errorMessage.value) {
    router.push('/clasificadores/objetos_gasto');
  }
};

const createObjetoGasto = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/objeto_gasto/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message || 'Error al crear';
    }
  } catch (error) {
    console.error('Error al crear:', error);
    errorMessage.value = 'Error del servidor';
  }
};

const updateObjetoGasto = async () => {
  try {
    const response = await fetch(
      `${global_vars.api_url}/objeto_gasto/update/${objetoGastoId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form.value)
      }
    );

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message || 'Error al actualizar';
    }
  } catch (error) {
    console.error('Error al actualizar:', error);
    errorMessage.value = 'Error del servidor';
  }
};

const handleDelete = async () => {
  if (!confirm('¿Está seguro de que desea eliminar este objeto de gasto?')) return;

  try {
    const response = await fetch(
      `${global_vars.api_url}/objeto_gasto/delete/${objetoGastoId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: form.value.user_id })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = data.message || 'Error al eliminar';
      return;
    }

    router.push('/clasificadores/objetos_gasto');
  } catch (error) {
    console.error('Error al eliminar:', error);
    errorMessage.value = 'Error del servidor';
  }
};

const fetchObjetoGasto = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/objeto_gasto/${objetoGastoId}`);
    const data = await response.json();

    if (!response.ok) {
      errorMessage.value = data.message || 'No se pudo cargar el objeto de gasto';
    } else {
      form.value = {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        esta_activo: data.esta_activo,
        user_id: sessionStorage.getItem('user_id')
      };
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    errorMessage.value = 'Error del servidor';
  }
};

if (isEditing) {
  onMounted(fetchObjetoGasto);
}
</script>

<template>
  <main class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div class="card p-3">
        <div>
          <router-link to="/clasificadores/objetos_gasto" class="btn btn-secondary mb-3">
            Volver atrás
          </router-link>
        </div>

        <h2>{{ isEditing ? 'Editar Objeto de Gasto' : 'Crear Objeto de Gasto' }}</h2>

        <form class="form" @submit.prevent="handleSubmit">
          <div class="form-group mb-3">
            <label class="form-label">Código:</label>
            <input
              v-model="form.codigo"
              type="text"
              class="form-control"
              required
              maxlength="20"
            />
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Nombre:</label>
            <input
              v-model="form.nombre"
              type="text"
              class="form-control"
              required
              maxlength="50"
            />
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Descripción:</label>
            <input
              v-model="form.descripcion"
              type="text"
              class="form-control"
              required
              maxlength="100"
            />
          </div>

          <input v-model="form.user_id" type="hidden" />

          <div class="form-check mb-3">
            <input
              v-model="form.esta_activo"
              type="checkbox"
              id="activoCheckbox"
              class="form-check-input"
            />
            <label for="activoCheckbox" class="form-check-label">Activo</label>
          </div>

          <div class="d-flex justify-content-between">
            <button class="btn btn-success" type="submit">Guardar</button>
            <button
              v-if="isEditing"
              class="btn btn-danger"
              type="button"
              @click="handleDelete"
            >
              Eliminar
            </button>
          </div>
        </form>

        <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>
      </div>
    </div>
  </main>
</template>
