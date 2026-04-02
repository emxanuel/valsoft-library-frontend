import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { libraryKeys } from "@/features/library/query-keys"
import * as libraryRequests from "@/features/library/services/requests"
import type {
  BookCreate,
  BookListPage,
  BookUpdate,
  CheckoutRequest,
  ClientCreate,
  ClientListPage,
  ClientUpdate,
  ListBooksParams,
  ListClientsParams,
} from "@/features/library/services/types"

export function useBooksQuery(params?: ListBooksParams) {
  return useQuery<BookListPage>({
    queryKey: libraryKeys.books(params),
    queryFn: () => libraryRequests.listBooks(params),
    staleTime: 0,
  })
}

export function useMyLoansQuery() {
  return useQuery({
    queryKey: libraryKeys.loans(),
    queryFn: () => libraryRequests.listMyOpenLoans(),
  })
}

export function useClientsQuery(params?: ListClientsParams) {
  return useQuery<ClientListPage>({
    queryKey: libraryKeys.clients(params),
    queryFn: () => libraryRequests.listClients(params),
    staleTime: 0,
  })
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClientCreate) =>
      libraryRequests.createClient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
      void queryClient.invalidateQueries({ queryKey: libraryKeys.loans() })
    },
  })
}

export function useUpdateClientMutation(clientId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClientUpdate) =>
      libraryRequests.updateClient(clientId, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
      void queryClient.setQueryData(libraryKeys.client(data.id), data)
      void queryClient.invalidateQueries({ queryKey: libraryKeys.loans() })
    },
  })
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clientId: number) => libraryRequests.deleteClient(clientId),
    onSuccess: (_void, clientId) => {
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
      void queryClient.removeQueries({ queryKey: libraryKeys.client(clientId) })
      void queryClient.invalidateQueries({ queryKey: libraryKeys.loans() })
    },
  })
}

export function useBookQuery(bookId: number, enabled = true) {
  return useQuery({
    queryKey: libraryKeys.book(bookId),
    queryFn: () => libraryRequests.getBook(bookId),
    enabled: enabled && bookId > 0,
  })
}

export function useCreateBookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookCreate) => libraryRequests.createBook(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
    },
  })
}

export function useUpdateBookMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookUpdate) =>
      libraryRequests.updateBook(bookId, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.setQueryData(libraryKeys.book(data.id), data)
    },
  })
}

export function useDeleteBookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookId: number) => libraryRequests.deleteBook(bookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
    },
  })
}

export function useCheckoutMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CheckoutRequest) =>
      libraryRequests.checkoutBook(bookId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.book(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: libraryKeys.loans() })
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
    },
  })
}

export function useCheckinMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => libraryRequests.checkinBook(bookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.book(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: libraryKeys.loans() })
    },
  })
}
