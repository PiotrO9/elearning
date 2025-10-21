export interface User {
    id: string
    email: string
    username: string
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
