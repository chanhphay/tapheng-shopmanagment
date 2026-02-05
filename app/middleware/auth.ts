export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Check if user is authenticated
  if (!user.value) {
    // Redirect to login page if not authenticated
    return navigateTo('/login')
  }
})
