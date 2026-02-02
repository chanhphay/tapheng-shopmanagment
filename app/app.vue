<template>
  <AppLayout>
    <NuxtPage />
  </AppLayout>
</template>

<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' }
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
</style>
