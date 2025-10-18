<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const authStore = useAuthStore()

onMounted(async () => {
  try {
    await authStore.fetchUser()
  } catch (error) {
    console.error('Failed to fetch user on mount:', error)
  }
})
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

