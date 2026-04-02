export type UserRole = "admin" | "employee"

export type UserRead = {
  id: number
  first_name: string
  last_name: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export type RegisterRequest = {
  first_name: string
  last_name: string
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  user: UserRead
}
