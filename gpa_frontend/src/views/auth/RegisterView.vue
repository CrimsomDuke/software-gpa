<script setup>
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import global_vars from '@/config/global_vars';
import { useUserStore } from '@/stores/user_store';
import ComboBox from '../components/ComboBox.vue';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  username: '',
  fullname: '',
  password: '',
  email: '',
  role_id: 0
})

const roles = ref([]);

const errorMessage = ref('');

const handleRegister = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem('user_id', data.id);
      await userStore.setUser();
      router.push("/");
    } else {
      errorMessage.value = data.message || 'Error de autenticación. Por favor, verifica tus credenciales.';
    }

  } catch (error) {
    console.error('Error during login:', error);
  }
}

const fetchRoles = async() => {
    try {
        const response = await fetch(`${global_vars.api_url}/roles`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            roles.value = await response.json();
        } else {
            errorMessage.value = 'Error al obtener los roles.';
        }
    } catch (error) {
        console.error('Error al obtener los roles:', error);
    }
}

onMounted(() => {
  fetchRoles();
});

</script>

<template>
  <div class="container d-flex align-items-center justify-content-center vh-100">
    <div class="login card">
      <h2>Registro</h2>
      <form class="form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="control-label">Nombre completo:</label>
          <input v-model="form.fullname" class="form-control" type="text" required />
        </div>
        <div class="form-group">
          <label class="control-label">Usuario:</label>
          <input v-model="form.username" class="form-control" type="text" required />
        </div>
        <div>
          <label class="control-label">Email:</label>
          <input v-model="form.email" class="form-control" type="email" required />
        </div>
        <div class="form-group">
          <label class="control-label">Contraseña:</label>
          <input v-model="form.password" class="form-control" type="password" required />
        </div>
        <div class="form-group">
          <label class="control-label">Rol:</label>
          <ComboBox :data-source="roles" text-field="name" value-field="id"
            :default-value="form.role_id" v-model="form.role_id"/>
        </div>
        <div class="form-group d-flex align-content-center justify-content-center m-3">
          <button class="btn btn-primary" type="submit">Registrarse</button>
        </div>
        <p class="text-danger" v-if="errorMessage">{{ errorMessage }}</p>
      </form>
      <p>Ya tienes una cuenta? <router-link to="/login">Inicia sesión</router-link></p>
    </div>
  </div>
</template>
<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
</style>