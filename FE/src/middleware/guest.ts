import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default function guestMiddleware(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
) {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
        next({ path: '/' })
    } else {
        next()
    }
}
