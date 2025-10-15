import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export default function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const isAuthenticated = Boolean(localStorage.getItem('token'))

  if (!isAuthenticated && to.meta.requiresAuth) {
    next({ path: '/login' })
  } else {
    next()
  }
}
