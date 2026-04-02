import type {
  ListAdminOpenLoansParams,
  ListStaffParams,
} from "@/features/admin/services/types"

export const adminKeys = {
  openLoans: (params?: ListAdminOpenLoansParams) =>
    [
      "admin",
      "loans",
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
  staffList: (params?: ListStaffParams) =>
    [
      "admin",
      "staff",
      params?.q ?? null,
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
  staff: (id: number) => ["admin", "staff", id] as const,
}
