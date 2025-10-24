export type UserRole = 'USER' | 'ADMIN'

export interface User {
    id: string
    email: string
    username: string
    role: UserRole
}

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
