import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useEffect } from "react"

import { authKeys } from "@/features/auth/query-keys"
import * as authRequests from "@/features/auth/services/requests"
import { useAuthStore } from "@/features/auth/stores/auth-store"

export function useMeQuery(enabled: boolean) {
  const setSession = useAuthStore((s) => s.setSession)
  const setStatus = useAuthStore((s) => s.setStatus)

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: authRequests.getMe,
    retry: false,
    enabled,
  })

  useEffect(() => {
    if (!enabled) return

    if (query.isPending) {
      setStatus("loading")
      return
    }

    if (query.isSuccess && query.data) {
      setSession(query.data)
      setStatus("authenticated")
      return
    }

    if (query.isError) {
      const err = query.error
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setSession(null)
      }
      setStatus("anonymous")
    }
  }, [
    enabled,
    query.isPending,
    query.isSuccess,
    query.data,
    query.isError,
    query.error,
    setSession,
    setStatus,
  ])

  return query
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: authRequests.login,
    onSuccess: (data) => {
      setSession(data.user)
      void queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authRequests.register,
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const reset = useAuthStore((s) => s.reset)

  return useMutation({
    mutationFn: authRequests.logout,
    onSettled: () => {
      reset()
      void queryClient.removeQueries({ queryKey: authKeys.me })
      void queryClient.clear()
    },
  })
}
