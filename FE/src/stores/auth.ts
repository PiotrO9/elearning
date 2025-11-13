import { defineStore } from 'pinia'
import { httpClient } from '@/utils'
import type { MeResponse, LoginResponse, RegisterResponse, User } from '@/types/user'
import { LoginScheme, RegisterScheme } from '@/schemas/user'
import * as z from 'zod'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
    },

    actions: {
        async login(credentials: z.infer<typeof LoginScheme>) {
            try {
                this.loading = true
                this.error = null
                const response = await httpClient.post<LoginResponse>('/auth/login', credentials)
                this.user = response.data.data.user
                return true
            } catch (err: any) {
                console.error('Login: ', err)
                this.error = err.response?.data?.message || 'Rejestracja nie powiodła się'
                return false
            } finally {
                this.loading = false
            }
        },

        async register(credentials: z.infer<typeof RegisterScheme>) {
            try {
                this.loading = true
                this.error = null
                await httpClient.post<RegisterResponse>('/auth/register', credentials)
                return true
            } catch (err: any) {
                console.error('Register: ', err)
                this.error = err.response?.data?.message || 'Rejestracja nie powiodła się'
                return false
            } finally {
                this.loading = false
            }
        },

        async logout() {
            try {
                this.loading = true
                this.error = null
                await httpClient.post('/auth/logout')
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Wylogowanie nie powiodło się'
            } finally {
                this.user = null
                this.error = null
                this.loading = false
            }
        },

        async fetchUser() {
            try {
                this.loading = true
                this.error = null

                const response = await httpClient.get<MeResponse>('/auth/me')
                this.user = response.data.data.user
            } catch (err: any) {
                this.user = null
                console.error(err)
            } finally {
                this.loading = false
            }
        },

        clearError() {
            this.error = null
        },
    },
})
