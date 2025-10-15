import { createRouter, createWebHistory } from 'vue-router'
import Home from './routes/Home.vue'
import { runMiddleware } from './middleware'
import authMiddleware from './middleware/auth'
import Login from './routes/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home},
    { path: '/login', component: Login },
    { path: "/courses", component: Home },
    { path: "/courses/:id", component: Home, meta: { requiresAuth: true, middleware: [authMiddleware]} },  ],
})

router.beforeEach((to, from, next) => {
  const middleware = to.meta.middleware as any[] | undefined
  if (middleware && middleware.length) {
    runMiddleware(middleware, to, from, next)
  } else {
    next()
  }
})

export default router
