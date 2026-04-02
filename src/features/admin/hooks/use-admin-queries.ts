import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { adminKeys } from "@/features/admin/query-keys"
import * as adminRequests from "@/features/admin/services/requests"
import { authKeys } from "@/features/auth/query-keys"
import { useAuthStore } from "@/features/auth/stores/auth-store"
import type {
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
  ListStaffParams,
} from "@/features/admin/services/types"

export function useStaffListQuery(params: ListStaffParams) {
  return useQuery({
    queryKey: adminKeys.staffList(params),
    queryFn: () => adminRequests.listStaff(params),
  })
}

export function useCreateStaffMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EmployeeCreatePayload) =>
      adminRequests.createStaff(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
    },
  })
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: EmployeeUpdatePayload
    }) => adminRequests.updateStaff(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
      void queryClient.invalidateQueries({
        queryKey: adminKeys.staff(variables.id),
      })
      const meId = useAuthStore.getState().user?.id
      if (meId !== undefined && variables.id === meId) {
        void queryClient.invalidateQueries({ queryKey: authKeys.me })
      }
    },
  })
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminRequests.deleteStaff(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
    },
  })
}
