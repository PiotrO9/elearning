import { createRouter, createWebHistory } from 'vue-router'
import Home from './routes/Home.vue'
import Profile from './routes/Profile.vue'
import { useAuthStore } from './stores/auth'
import Courses from './routes/Courses.vue'
import CourseDetails from './routes/CourseDetails.vue'
import Auth from './routes/Auth.vue'
import NotFound from './routes/NotFound.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: Home, name: 'home' },
        { path: '/auth', component: Auth, meta: { guest: true }, name: 'login' },
        { path: '/auth?mode=register', component: Auth, meta: { guest: true }, name: 'register' },
        { path: '/profile', component: Profile, meta: { requiresAuth: true }, name: 'profile' },
        { path: '/courses', component: Courses, name: 'courses' },
        {
            path: '/courses/:id',
            component: CourseDetails,
            meta: { requiresAuth: true },
            name: 'course-details',
        },
        { path: '/:pathMatch(.*)*', component: NotFound },
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
        return next({ path: '/auth', query: { redirect: to.fullPath } })
    }

    if (to.meta.guest && authStore.isAuthenticated) {
        return next({ path: '/' })
    }

    next()
})

export default router
