export default defineNuxtConfig({
  compatibilityDate: '2026-01-24',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],
  supabase: {
    redirect: false,
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    types: false  // Disable database types to remove warning
  },
  css: ['~/assets/css/fonts.css'],
  app: {
    head: {
      title: 'ລະບົບຈັດການຮ້ານຕາແພງ Baby',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'theme-color', content: '#667eea' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/logo.png' },
        { rel: 'apple-touch-icon', href: '/images/logo.png' }
      ]
    }
  },
  nitro: {
    preset: 'cloudflare-pages',
  },
  vite: {
    optimizeDeps: {
      exclude: ['@supabase/supabase-js']
    }
  }
})