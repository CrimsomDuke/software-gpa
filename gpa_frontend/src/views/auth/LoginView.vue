<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import global_vars from '@/config/global_vars';

const router = useRouter();

const form = ref({
  username: '',
  password: ''
})

const errorMessage = ref('');

const handleLogin = async () => {
  try {
    const response = await fetch(`${global_vars.api_url}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem('user_id', data.id);
      router.push("/");
    } else {
      errorMessage.value = data.message || 'Error de autenticación. Por favor, verifica tus credenciales.';
    }

  } catch (error) {
    console.error('Error during login:', error);
  }
}
</script>

<template>
  <div class="container d-flex align-items-center justify-content-center vh-100">
    <div class="login card">
      <h2>Login</h2>
      <form class="form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="control-label">Usuario:</label>
          <input v-model="form.username" id="username" name="username" class="form-control" type="text" required />
        </div>
        <div class="form-group">
          <label class="control-label">Contraseña:</label>
          <input v-model="form.password" id="password" name="password" class="form-control" type="password" required />
        </div>
        <div class="form-group d-flex align-content-center justify-content-center m-3">
          <button class="btn btn-primary" type="submit">Login</button>
        </div>
        <p v-if="errorMessage" class="text-danger error-label">{{ errorMessage }}</p>
      </form>
      <p>No tienes una cuenta? <router-link to="/register">Registrate</router-link></p>
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