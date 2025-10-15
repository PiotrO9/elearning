<script lang="ts" setup>
  import Navbar from './components/Navbar.vue';
  import Footer from './components/Footer.vue';
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <main class="flex-1 h-full">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

