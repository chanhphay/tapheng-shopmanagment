<template>
  <div class="layout">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <h2>🏪 Tapheng Shop</h2>
      <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <!-- Sidebar Navigation -->
    <nav class="sidebar" :class="{ 'menu-open': menuOpen }">
      <div class="logo">
        <h2>🏪 Tapheng Shop</h2>
      </div>
      <ul class="menu">
        <li>
          <NuxtLink to="/" :class="{ active: $route.path === '/' }" @click="closeMenu">
            📦 ຈັດການສິນຄ້າ
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/stock-imports" :class="{ active: $route.path === '/stock-imports' }" @click="closeMenu">
            📥 ນຳເຂົ້າສິນຄ້າ
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/orders" :class="{ active: $route.path === '/orders' }" @click="closeMenu">
            📝 ອໍເດີລູກຄ້າ
          </NuxtLink>
        </li>
      </ul>
    </nav>
    
    <!-- Overlay for mobile menu -->
    <div class="overlay" :class="{ 'show': menuOpen }" @click="closeMenu"></div>
    
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup>
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  align-items: center;
  justify-content: space-between;
}

.mobile-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-family: 'Phetsarath-OT', sans-serif;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-toggle span {
  width: 25px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s;
}

.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 998;
  opacity: 0;
  transition: opacity 0.3s;
}

.overlay.show {
  opacity: 1;
}

.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  position: relative;
  z-index: 999;
}

.logo {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.logo h2 {
  margin: 0;
  font-size: 1.3rem;
  font-family: 'Phetsarath-OT', sans-serif;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  margin-bottom: 10px;
}

.menu a {
  display: block;
  padding: 12px 15px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
}

.menu a:hover {
  background: rgba(255,255,255,0.1);
  padding-left: 20px;
}

.menu a.active {
  background: rgba(255,255,255,0.2);
  font-weight: 600;
}

.content {
  flex: 1;
  overflow-y: auto;
}

/* Tablet styles (768px - 1024px) */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }
  
  .logo h2 {
    font-size: 1.1rem;
  }
  
  .menu a {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
}

/* Mobile styles (< 768px) */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: -250px;
    bottom: 0;
    width: 250px;
    transition: left 0.3s ease-in-out;
    z-index: 999;
    padding-top: 20px;
  }
  
  .sidebar.menu-open {
    left: 0;
  }
  
  .sidebar .logo {
    display: none;
  }
  
  .overlay {
    display: block;
  }
  
  .content {
    margin-top: 60px;
    width: 100%;
  }
}

/* Small mobile (< 480px) */
@media (max-width: 480px) {
  .mobile-header h2 {
    font-size: 1rem;
  }
  
  .sidebar {
    width: 220px;
    left: -220px;
  }
  
  .menu a {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}
</style>
