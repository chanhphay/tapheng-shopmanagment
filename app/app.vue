<template>
  <div>
    <AppLayout v-if="mounted">
      <NuxtPage />
    </AppLayout>
    <div v-else class="app-loading">
      <div class="loader"></div>
      <p>ກຳລັງໂຫຼດ...</p>
    </div>
  </div>
</template>

<script setup>
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { charset: 'utf-8' }
  ]
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Phetsarath-OT', sans-serif;
  background-color: #f5f5f5;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Improve touch targets for mobile */
button, a {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}

/* Prevent text selection on buttons */
button {
  -webkit-user-select: none;
  user-select: none;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Better table scrolling on mobile */
table {
  -webkit-overflow-scrolling: touch;
}

/* App loading screen */
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.app-loading p {
  margin-top: 20px;
  font-size: 1.1rem;
  color: #666;
}
</style>
