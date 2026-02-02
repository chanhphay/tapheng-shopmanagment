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
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/logo.png' }
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