import { createRouter, createWebHistory } from 'vue-router'
import Home from './routes/Home.vue'
import Login from './routes/Login.vue'
import Register from './routes/Register.vue'
import Profile from './routes/Profile.vue'
import { useAuthStore } from './stores/auth'
import Courses from './routes/Courses.vue'
import CourseDetails from './routes/CourseDetails.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: Home },
        { path: '/login', component: Login, meta: { guest: true } },
        { path: '/register', component: Register, meta: { guest: true } },
        { path: '/profile', component: Profile, meta: { requiresAuth: true } },
        { path: '/courses', component: Courses },
        { path: '/courses/:id', component: CourseDetails, meta: { requiresAuth: true } },
    ],
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.user) {
        try {
            await authStore.fetchUser()
        } catch (error) {
            console.error('Failed to fetch user:', error)
        }
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    if (to.meta.guest && authStore.isAuthenticated) {
        return next({ path: '/' })
    }

    next()
})

export default router
