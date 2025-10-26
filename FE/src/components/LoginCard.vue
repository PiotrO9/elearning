<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { LoginScheme } from '@/schemas/user'
import Input from './ui/Input.vue'
import Button from './ui/Button.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errors = ref<Record<string, string>>({})

async function handleSubmit() {
    errors.value = {}
    authStore.clearError()

    const validation = LoginScheme.safeParse({ email: email.value, password: password.value })

    if (!validation.success) {
        validation.error.issues.forEach((err) => {
            if (err.path[0]) {
                errors.value[err.path[0] as string] = err.message
            }
        })
        return
    }

    const success = await authStore.login(validation.data)

    if (success) {
        const redirectPath = (route.query.redirect as string) || '/'
        router.push(redirectPath)
    }
}
</script>

<template>
    <div class="bg-background-secondary w-full max-w-lg p-6 shadow-lg rounded-lg">
        <h1 class="text-center font-bold text-xl uppercase">Zaloguj Się</h1>

        <div
            v-if="authStore.error"
            class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
        >
            {{ authStore.error }}
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-3 mt-6">
            <div>
                <Input
                    v-model="email"
                    placeholder="Email"
                    class="w-full"
                    type="email"
                    :disabled="authStore.loading"
                />
                <span v-if="errors.email" class="text-red-500 text-xs mt-1">{{
                    errors.email
                }}</span>
            </div>

            <div>
                <Input
                    v-model="password"
                    placeholder="Hasło"
                    class="w-full"
                    type="password"
                    :disabled="authStore.loading"
                />
                <span v-if="errors.password" class="text-red-500 text-xs mt-1">{{
                    errors.password
                }}</span>
            </div>

            <Button type="outline" variant="primary" :disabled="authStore.loading">
                {{ authStore.loading ? 'Ładowanie...' : 'Prześlij' }}
            </Button>

            <div class="text-center text-sm mt-2">
                Nie masz konta?
                <RouterLink
                    to="/auth?mode=register"
                    @click="authStore.clearError"
                    class="text-blue-600 hover:underline"
                    >Zarejestruj się</RouterLink
                >
            </div>
        </form>
    </div>
</template>
