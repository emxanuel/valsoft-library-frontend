import type { ListStaffParams } from "@/features/admin/services/types"

export const adminKeys = {
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
