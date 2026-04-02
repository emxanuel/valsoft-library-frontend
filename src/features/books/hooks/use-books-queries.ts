import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { booksKeys } from "@/features/books/query-keys"
import * as booksRequests from "@/features/books/services/requests"
import type {
  BookCopyCreate,
  BookCopyListResponse,
  BookCopyUpdate,
  BookCreate,
  BookListPage,
  BookUpdate,
  CheckoutRequest,
  ListBooksParams,
} from "@/features/books/services/types"
import { loansKeys } from "@/features/loans/query-keys"

export function useBooksQuery(params?: ListBooksParams) {
  return useQuery<BookListPage>({
    queryKey: booksKeys.books(params),
    queryFn: () => booksRequests.listBooks(params),
    staleTime: 0,
  })
}

export function useBookQuery(bookId: number, enabled = true) {
  return useQuery({
    queryKey: booksKeys.book(bookId),
    queryFn: () => booksRequests.getBook(bookId),
    enabled: enabled && bookId > 0,
  })
}

export function useBookCopiesQuery(bookId: number, enabled = true) {
  return useQuery<BookCopyListResponse>({
    queryKey: booksKeys.bookCopies(bookId),
    queryFn: () => booksRequests.listBookCopies(bookId),
    enabled: enabled && bookId > 0,
  })
}

export function useCreateBookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookCreate) => booksRequests.createBook(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
    },
  })
}

export function useUpdateBookMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookUpdate) =>
      booksRequests.updateBook(bookId, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.setQueryData(booksKeys.book(data.id), data)
    },
  })
}

export function useDeleteBookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookId: number) => booksRequests.deleteBook(bookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
    },
  })
}

export function useCheckoutMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CheckoutRequest) =>
      booksRequests.checkoutBook(bookId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.invalidateQueries({
        queryKey: booksKeys.book(bookId),
      })
      void queryClient.invalidateQueries({
        queryKey: booksKeys.bookCopies(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: loansKeys.loans() })
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
      void queryClient.invalidateQueries({ queryKey: ["library", "loans", "history"] })
    },
  })
}

export function useCreateBookCopyMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookCopyCreate) =>
      booksRequests.createBookCopy(bookId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.invalidateQueries({
        queryKey: booksKeys.book(bookId),
      })
      void queryClient.invalidateQueries({
        queryKey: booksKeys.bookCopies(bookId),
      })
    },
  })
}

export function useUpdateBookCopyMutation(bookId: number, copyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookCopyUpdate) =>
      booksRequests.updateBookCopy(copyId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: booksKeys.bookCopies(bookId),
      })
      void queryClient.invalidateQueries({
        queryKey: booksKeys.book(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
    },
  })
}

export function useDeleteBookCopyMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (copyId: number) => booksRequests.deleteBookCopy(copyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: booksKeys.bookCopies(bookId),
      })
      void queryClient.invalidateQueries({
        queryKey: booksKeys.book(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
    },
  })
}
