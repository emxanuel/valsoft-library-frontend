import { api } from "@/features/shared/services/client"

import type {
  AdminOpenLoansPage,
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
  ListAdminOpenLoansParams,
  ListStaffParams,
  StaffListPage,
  StaffRead,
} from "./types"

export async function listAdminOpenLoans(
  params?: ListAdminOpenLoansParams,
): Promise<AdminOpenLoansPage> {
  const { data } = await api.get<AdminOpenLoansPage>("/admin/loans", {
    params,
  })
  return data
}

export async function listStaff(
  params: ListStaffParams,
): Promise<StaffListPage> {
  const { data } = await api.get<StaffListPage>("/admin/employees", {
    params: {
      q: params.q,
      offset: params.offset,
      limit: params.limit,
    },
  })
  return data
}

export async function getStaff(id: number): Promise<StaffRead> {
  const { data } = await api.get<StaffRead>(`/admin/employees/${id}`)
  return data
}

export async function createStaff(
  payload: EmployeeCreatePayload,
): Promise<StaffRead> {
  const { data } = await api.post<StaffRead>("/admin/employees", payload)
  return data
}

export async function updateStaff(
  id: number,
  payload: EmployeeUpdatePayload,
): Promise<StaffRead> {
  const { data } = await api.patch<StaffRead>(
    `/admin/employees/${id}`,
    payload,
  )
  return data
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/admin/employees/${id}`)
}
