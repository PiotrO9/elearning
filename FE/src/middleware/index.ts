import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

type Middleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => void | Promise<void>

export function runMiddleware(
  middleware: Middleware[],
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const stack = middleware.slice().reverse()
  let called = false

  const _next: NavigationGuardNext = async (params?: any) => {
    if (called) return
    called = true
    
    if (params !== undefined) return next(params)
    const fn = stack.pop()
    if (fn) {
      called = false
      await fn(to, from, _next)
    } else {
      next()
    }
  }

  _next()
}