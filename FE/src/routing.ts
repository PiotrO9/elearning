import { createRouter, createWebHistory } from 'vue-router'
import Home from './routes/Home.vue'
import Login from './routes/Login.vue'
import Register from './routes/Register.vue'
import Profile from './routes/Profile.vue'
import Courses from './routes/Courses.vue'
import CourseDetails from './routes/CourseDetails.vue'
import AdminDashboard from './routes/admin/Dashboard.vue'
import AdminCourses from './routes/admin/AdminCourses.vue'
import AdminTags from './routes/admin/AdminTags.vue'
import AdminUsers from './routes/admin/AdminUsers.vue'
import { useAuthStore } from './stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: Home },
        { path: '/login', component: Login, meta: { guest: true } },
        { path: '/register', component: Register, meta: { guest: true } },
        { path: '/profile', component: Profile, meta: { requiresAuth: true } },
        { path: '/courses', component: Courses },
        { path: '/courses/:id', component: CourseDetails, meta: { requiresAuth: true } },

        // Admin routes
        {
            path: '/admin',
            component: AdminDashboard,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/admin/courses',
            component: AdminCourses,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/admin/tags',
            component: AdminTags,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/admin/users',
            component: AdminUsers,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
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

    // TYMCZASOWO WYŁĄCZONE - aby można było testować panel admina bez roli admin
    // if (to.meta.requiresAdmin && !authStore.isAdmin) {
    //     return next({ path: '/' })
    // }

    if (to.meta.guest && authStore.isAuthenticated) {
        return next({ path: '/' })
    }

    next()
})

export default router
