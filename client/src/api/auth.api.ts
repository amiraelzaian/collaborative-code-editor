import { api } from "./client"

import type { User } from "../types/user"


type AuthResponse = { accessToken: string, data: User };


export const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return { accessToken: res.data.accessToken, user: res.data.data }
}

export const register = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
    return { accessToken: res.data.accessToken, user: res.data.data }
}

export const logout = async () => {
    api.post('/auth/logout')
}

export const getMe = async () => {
    const res = await api.get<{ data: User }>("/auth/me");
    return res.data.data

}


