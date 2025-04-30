<script setup>
// Login logic will go here
</script>

<template>
    <div class="login card">
      <h2>Registro</h2>
      <form class="form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="control-label">Usuario:</label>
          <input class="form-control" type="email" required />
        </div>
        <div class="form-group">
          <label class="control-label">Contraseña:</label>
          <input class="form-control" type="password" required />
        </div>
        <div class="form-group d-flex align-content-center justify-content-center m-3">
          <button class="btn btn-primary" type="submit">Login</button>
        </div>
      </form>
      <p>Ya tienes una cuenta? <router-link to="/login">Inicia sesión</router-link></p>
    </div>
  </template>
<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
</style>