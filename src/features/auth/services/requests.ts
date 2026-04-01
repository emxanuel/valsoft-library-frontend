import { api } from "@/features/shared/services/client"
import type { LoginRequest, LoginResponse, RegisterRequest, UserRead } from "./types"

export async function register(payload: RegisterRequest): Promise<UserRead> {
  const { data } = await api.post<UserRead>("/auth/register", payload)
  return data
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload)
  return data
}

export async function getMe(): Promise<UserRead> {
  const { data } = await api.get<UserRead>("/auth/me")
  return data
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout")
}
