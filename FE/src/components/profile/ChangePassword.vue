<script lang="ts" setup>
import { ref } from 'vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleChangePassword() {
    errorMessage.value = ''
    successMessage.value = ''

    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
        errorMessage.value = 'Wszystkie pola są wymagane'
        return
    }

    if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = 'Nowe hasła nie pasują do siebie'
        return
    }

    if (newPassword.value.length < 6) {
        errorMessage.value = 'Nowe hasło musi mieć minimum 6 znaków'
        return
    }

    try {
        isLoading.value = true
        // TODO: Implement API call to change password
        console.log('Changing password...')

        // Success success
        await new Promise((resolve) => setTimeout(resolve, 1000))
        successMessage.value = 'Hasło zostało pomyślnie zmienione'

        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
    } catch {
        errorMessage.value = 'Wystąpił błąd podczas zmiany hasła'
    } finally {
        isLoading.value = false
    }
}

function clearMessages() {
    errorMessage.value = ''
    successMessage.value = ''
}
</script>

<template>
    <div class="bg-white rounded-2xl shadow-md border border-border overflow-hidden">
        <div class="bg-white border-b border-primary p-6">
            <h3 class="text-xl font-bold text-text">Zmiana hasła</h3>
        </div>

        <div class="p-6">
            <form @submit.prevent="handleChangePassword" class="space-y-4">
                <div>
                    <label
                        for="current-password"
                        class="text-sm font-semibold text-text-muted block mb-2"
                    >
                        Obecne hasło
                    </label>
                    <Input
                        id="current-password"
                        v-model="currentPassword"
                        type="password"
                        placeholder="Wprowadź obecne hasło"
                        :disabled="isLoading"
                        @input="clearMessages"
                    />
                </div>
                <div>
                    <label
                        for="new-password"
                        class="text-sm font-semibold text-text-muted block mb-2"
                    >
                        Nowe hasło
                    </label>
                    <Input
                        id="new-password"
                        v-model="newPassword"
                        type="password"
                        placeholder="Wprowadź nowe hasło (min. 6 znaków)"
                        :disabled="isLoading"
                        @input="clearMessages"
                    />
                </div>
                <div>
                    <label
                        for="confirm-password"
                        class="text-sm font-semibold text-text-muted block mb-2"
                    >
                        Potwierdź nowe hasło
                    </label>
                    <Input
                        id="confirm-password"
                        v-model="confirmPassword"
                        type="password"
                        placeholder="Wprowadź nowe hasło ponownie"
                        :disabled="isLoading"
                        @input="clearMessages"
                    />
                </div>

                <!-- Error -->
                <div
                    v-if="errorMessage"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                    {{ errorMessage }}
                </div>

                <!-- Success -->
                <div
                    v-if="successMessage"
                    class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                >
                    {{ successMessage }}
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                    <Button :disabled="isLoading" class="w-full">
                        {{ isLoading ? 'Zapisywanie...' : 'Zmień hasło' }}
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>
