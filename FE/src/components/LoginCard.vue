<script lang="ts" setup>
    import Input from './ui/Input.vue';
</script>

<template>
    <div class="bg-white w-full max-w-lg p-6 shadow-lg rounded-lg">
        <h1 class="text-center font-bold text-xl uppercase">Zaloguj Się</h1>
        <form @submit.prevent class="flex flex-col gap-3 mt-6">
            <Input placeholder="Email" class="w-full"/>
            <Input placeholder="Hasło" class="w-full" type="password"/>
            <button class="w-full py-2 cursor-pointer border rounded border-blue-300 hover:border-blue-400 duration-300 bg-white hover:bg-zinc-50" type="submit">Prześlij</button>
        </form>
    </div>
</template>