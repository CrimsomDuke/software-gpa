<script setup>
import Navbar from './components/NavBar.vue';
</script>

<template>
  <div class="d-flex">
    <Navbar />
    <div class="container p-4 m-4">
      <div class="card shadow-lg rounded p-5 bg-light">
        <h1 class="text-primary mb-3">Bienvenido a Sao Digital</h1>
        <p class="lead">
          En <strong>Sao Digital</strong> nos dedicamos a crear soluciones tecnológicas innovadoras para transformar la manera en que las organizaciones operan, optimizando procesos y potenciando el desarrollo digital.
        </p>

        <hr class="my-4" />

        <h3 class="text-secondary">¿Quiénes somos?</h3>
        <p>
          Sao Digital es una empresa tecnológica fundada con la visión de brindar herramientas eficientes, intuitivas y personalizadas para resolver los desafíos digitales más exigentes de hoy.
        </p>

        <h4 class="mt-4">Fundadores de Sao Digital</h4>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">👨‍💻 Sebastián Rengel</li>
          <li class="list-group-item">👩‍💻 Helen Baldelomar</li>
          <li class="list-group-item">👨‍💻 Bruno Cerusoli</li>
          <li class="list-group-item">👨‍💻 Freddy Espinosa</li>
          <li class="list-group-item">👨‍💻 Jhonatan Soriano</li>
          <li class="list-group-item">👨‍💻 Leonel Loza</li>
          <li class="list-group-item">👨‍💻 Paul Amaya</li>
        </ul>

        <hr class="my-4" />

        <p class="mt-5 text-center text-secondary">
          © 2025 Sao Digital - Todos los derechos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #f8f9fa;
  border: none;
  border-radius: 15px;
}

h1 {
  font-weight: 700;
}

.list-group-item {
  font-size: 1.1rem;
}
</style>
