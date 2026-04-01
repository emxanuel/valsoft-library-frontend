export type UserRead = {
  first_name: string
  last_name: string
  email: string
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
