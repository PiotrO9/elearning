import * as z from "zod";

// TODO - Zmień nazwę pliku na user.ts
export interface User {
    id: string
    email: string
    username: string
}

// TODO - Ja bym zrobił osobny plik na schematy zweryfikowane przez zod
export const RegisterScheme = z.object({
    email: z.email({ message: "Nieprawidłowy adres email" }),
    username: z.string()
        .min(3, { message: "Nazwa użytkownika musi zawierać co najmniej 3 znaki" })
        .max(30, { message: "Nazwa użytkownika musi zawierać maksymalnie 30 znaków" }),
    password: z.string().min(6, { message: "Hasło musi zawierać co najmniej 6 znaków" }).max(100, { message: "Hasło może zawierać maksymalnie 100 znaków" })
})

export const LoginScheme = z.object({
    email: z.email({ message: "Nieprawidłowy adres email" }),
    password: z.string().min(6, { message: "Hasło musi zawierać co najmniej 6 znaków" }).max(100, { message: "Hasło może zawierać maksymalnie 100 znaków" }),
})

export type LoginResponse = {
    success: boolean
    message: string
    data: { user: User }
}

export type MeResponse = {
    success: boolean
    data: { user: User }
}

export type RegisterResponse = {
    success: boolean
    message: string
}
