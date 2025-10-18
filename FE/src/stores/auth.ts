import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { httpClient } from '@/utils'
import type { User, LoginResponse, MeResponse, RegisterResponse } from '@/types/User'
import type { z } from 'zod'
import { LoginScheme, RegisterScheme } from '@/types/User'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  const fetchUser = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await httpClient.get<MeResponse>('/auth/me')
      user.value = response.data.data.user
    } catch (err: any) {
      user.value = null
      if (err.response?.status !== 401) {
        error.value = err.response?.data?.message || 'Nie udało się pobrać danych użytkownika'
      }
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials: z.infer<typeof LoginScheme>) => {
    try {
      loading.value = true
      error.value = null
      const response = await httpClient.post<LoginResponse>('/auth/login', credentials)
      user.value = response.data.data.user
      return true
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.code === 'ERR_NETWORK') {
        error.value = 'Nie można połączyć się z serwerem. Upewnij się, że backend jest uruchomiony.'
      } else {
        error.value = err.response?.data?.message || 'Logowanie nie powiodło się'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (credentials: z.infer<typeof RegisterScheme>) => {
    try {
      loading.value = true
      error.value = null
      await httpClient.post<RegisterResponse>('/auth/register', credentials)
      return true
    } catch (err: any) {
      console.error('Register error:', err)
      if (err.code === 'ERR_NETWORK') {
        error.value = 'Nie można połączyć się z serwerem. Upewnij się, że backend jest uruchomiony.'
      } else {
        error.value = err.response?.data?.message || 'Rejestracja nie powiodła się'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      await httpClient.post('/auth/logout')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Wylogowanie nie powiodło się'
    } finally {
      user.value = null
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout,
    clearError
  }
})
