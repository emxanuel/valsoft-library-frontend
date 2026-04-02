import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { clientsKeys } from "@/features/clients/query-keys"
import * as clientsRequests from "@/features/clients/services/requests"
import type {
  ClientCreate,
  ClientListPage,
  ClientUpdate,
  ListClientsParams,
} from "@/features/clients/services/types"
import { loansKeys } from "@/features/loans/query-keys"

export function useClientQuery(clientId: number, enabled = true) {
  return useQuery({
    queryKey: clientsKeys.client(clientId),
    queryFn: () => clientsRequests.getClient(clientId),
    enabled: enabled && clientId > 0,
  })
}

export function useClientsQuery(params?: ListClientsParams) {
  return useQuery<ClientListPage>({
    queryKey: clientsKeys.clients(params),
    queryFn: () => clientsRequests.listClients(params),
    staleTime: 0,
  })
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClientCreate) =>
      clientsRequests.createClient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
      void queryClient.invalidateQueries({ queryKey: loansKeys.loans() })
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
    },
  })
}

export function useUpdateClientMutation(clientId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClientUpdate) =>
      clientsRequests.updateClient(clientId, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
      void queryClient.setQueryData(clientsKeys.client(data.id), data)
      void queryClient.invalidateQueries({ queryKey: loansKeys.loans() })
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
    },
  })
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clientId: number) => clientsRequests.deleteClient(clientId),
    onSuccess: (_void, clientId) => {
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
      void queryClient.removeQueries({ queryKey: clientsKeys.client(clientId) })
      void queryClient.invalidateQueries({ queryKey: loansKeys.loans() })
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
      void queryClient.invalidateQueries({ queryKey: ["library", "loans", "history"] })
    },
  })
}
