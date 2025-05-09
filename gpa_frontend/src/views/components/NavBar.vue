<template>
  <nav class="sidebar">
    <h1 class="logo">Sao Digital</h1>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/seguridad/usuarios">Seguridad</router-link></li>
      <li><router-link to="/dashboard">Dashboard</router-link></li>
      <li><router-link to="/employees">Employees</router-link></li>
      <li><router-link to="/departments">Departments</router-link></li>
      <li><router-link to="/positions">Positions</router-link></li>
      <li><router-link to="/reports">Reports</router-link></li>
      <li><router-link to="/about">About</router-link></li>
    </ul>
  </nav>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #0f1355, #000000);
  padding-top: 30px;
}


.sidebar h1 {
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin: 10px 0;
}

.sidebar a {
  color: white;
  text-decoration: none;
  display: block;
  padding: 12px 20px;
  font-size: 16px;
}

.sidebar a.router-link-exact-active {
  background: linear-gradient(to right, #386dff, #000000);
  color: white;
}
</style>
