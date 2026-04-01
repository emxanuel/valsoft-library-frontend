import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { libraryKeys } from "@/features/library/query-keys"
import * as libraryRequests from "@/features/library/services/requests"
import type {
  BookCreate,
  BookUpdate,
  CheckoutRequest,
  ListBooksParams,
} from "@/features/library/services/types"

export function useBooksQuery(params?: ListBooksParams) {
  return useQuery({
    queryKey: libraryKeys.books(params),
    queryFn: () => libraryRequests.listBooks(params),
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
    },
  })
}
