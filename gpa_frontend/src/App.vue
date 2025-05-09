<script setup>
import NavBar from './views/components/Navbar.vue'
import FooterView from './views/components/FooterView.vue'
</script>

<template>
  <div class="app-wrapper">
    <NavBar />
    <div class="content-wrapper">
      <main class="main-content">
        <router-view />
      </main>
      <FooterView />
    </div>
  </div>
</template>

<style scoped>

.app-wrapper {
  display: flex;
  min-height: 110vh;
  flex-direction: row;
  width: 100vw;
  overflow-x: hidden;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  padding-left: 240px;
  box-sizing: border-box;
}

header {
  line-height: 1.5;
}
</style>
