import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

type Middleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => void

export function runMiddleware(
  middleware: Middleware[],
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const stack = middleware.slice().reverse()

  const _next: NavigationGuardNext = (params?: any) => {
    if (params !== undefined) return next(params)
    const fn = stack.pop()
    if (fn) {
      fn(to, from, _next)
    } else {
      next()
    }
  }

  _next()
}