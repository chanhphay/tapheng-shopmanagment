<template>
  <div>
    <div v-if="error" class="error-screen">
      <h1>❌ Error</h1>
      <div class="error-details">
        <p><strong>Message:</strong> {{ error.message }}</p>
        <p><strong>Type:</strong> {{ error.type }}</p>
        <p v-if="error.stack"><strong>Stack:</strong></p>
        <pre v-if="error.stack">{{ error.stack }}</pre>
      </div>
      <button @click="reloadPage" class="reload-btn">Reload Page</button>
      <div class="debug-info">
        <p><strong>User Agent:</strong> {{ userAgent }}</p>
        <p><strong>Timestamp:</strong> {{ new Date().toISOString() }}</p>
      </div>
    </div>
    <AppLayout>
      <NuxtPage />

      <!-- Loading overlay shown until app finishes mounting to avoid SSR mismatch -->
      <div v-if="!mounted" class="app-loading-overlay">
        <div class="loader"></div>
        <p>ກຳລັງໂຫຼດ...</p>
        <p class="loading-step">{{ loadingStep }}</p>
      </div>
    </AppLayout>
  </div>
</template>

<script setup>
const mounted = ref(false)
const error = ref(null)
const userAgent = ref('')
const loadingStep = ref('Initializing...')

// Global error handler
const captureError = (err, type = 'Error') => {
  console.error(`[${type}]`, err)
  error.value = {
    message: err.message || String(err),
    type: type,
    stack: err.stack || '',
    timestamp: new Date().toISOString()
  }
}

// Capture unhandled errors
if (process.client) {
  window.addEventListener('error', (event) => {
    captureError(event.error || event, 'Global Error')
    event.preventDefault()
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, 'Unhandled Promise Rejection')
    event.preventDefault()
  })
  
  userAgent.value = navigator.userAgent
}

onMounted(async () => {
  try {
    console.log('App mounted - starting initialization')
    loadingStep.value = 'Loading components...'
    
    await nextTick()
    
    loadingStep.value = 'Checking Supabase connection...'
    console.log('Supabase URL:', useRuntimeConfig().public.supabase?.url || 'Not configured')
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    loadingStep.value = 'Ready!'
    console.log('App initialization complete')
    
    mounted.value = true
  } catch (err) {
    console.error('Mount error:', err)
    captureError(err, 'Mount Error')
  }
})

const reloadPage = () => {
  if (process.client) {
    window.location.reload()
  }
}

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

/* App loading overlay */
.app-loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(245,245,245,0.95);
  z-index: 2000;
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

.app-loading-overlay p {
  margin-top: 20px;
  font-size: 1.1rem;
  color: #666;
}

.loading-step {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #999;
}

/* Error screen */
.error-screen {
  min-height: 100vh;
  padding: 20px;
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-screen h1 {
  color: #d32f2f;
  margin-bottom: 20px;
}

.error-details {
  background-color: #ffebee;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  word-wrap: break-word;
}

.error-details p {
  margin-bottom: 10px;
  color: #333;
}

.error-details pre {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.reload-btn {
  background-color: #4CAF50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 20px;
}

.reload-btn:active {
  background-color: #45a049;
}

.debug-info {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  font-size: 0.85rem;
}

.debug-info p {
  margin-bottom: 5px;
  color: #666;
  word-wrap: break-word;
}
</style>
