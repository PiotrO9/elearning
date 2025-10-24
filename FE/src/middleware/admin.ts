import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function adminMiddleware(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
) {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    if (!authStore.isAdmin) {
        return next({ path: '/' })
    }

    next()
}

