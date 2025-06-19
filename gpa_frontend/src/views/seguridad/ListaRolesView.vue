<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import global_vars from '@/config/global_vars';

const roles = ref([]);
const errorMessage = ref('');
const router = useRouter();

const fetchRoles = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/roles`);
    const data = await response.json();

    if (!response.ok) {
      errorMessage.value = data.message || 'Error al obtener roles';
      return;
    }

    roles.value = data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    errorMessage.value = 'Error del servidor';
  }
};

const goToEdit = (id) => {
  router.push(`/seguridad/roles/form/${id}`);
};

onMounted(fetchRoles);
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div class="card p-3 w-100">
        <div class="justify-content-between align-items-center mb-3">
          <h2>Catálogo de Roles</h2>
          <router-link to="/seguridad/roles/form" class="btn btn-primary">Nuevo Rol</router-link>
        </div>

        <table class="table table-striped table-bordered mt-3">
          <thead>
            <tr>
              <th class="gradient-blue text-white">ID</th>
              <th class="gradient-blue text-white">Nombre</th>
              <th class="gradient-blue text-white">Descripción</th>
              <th class="gradient-blue text-white">Nivel</th>
              <th class="gradient-blue text-white">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td>{{ role.id }}</td>
              <td>{{ role.name }}</td>
              <td>{{ role.description || '-' }}</td>
              <td>{{ role.level }}</td>
              <td>
                <button class="btn btn-sm btn-warning" @click="goToEdit(role.id)">
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.d-flex {
  display: flex;
}
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.card {
  border-radius: 8px;
  padding: 1rem;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.gradient-blue {
  background: linear-gradient(90deg, #3f87a6, #153b56);
}
.text-white {
  color: white;
}
</style>
