import type { UserRole } from "@/features/auth/services/types"

export type StaffRead = {
  id: number
  first_name: string
  last_name: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export type StaffListPage = {
  items: StaffRead[]
  total: number
  limit: number
  offset: number
}

export type EmployeeCreatePayload = {
  first_name: string
  last_name: string
  email: string
  password: string
}

export type EmployeeUpdatePayload = {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  role?: UserRole
}

export type ListStaffParams = {
  q?: string
  offset: number
  limit: number
}
