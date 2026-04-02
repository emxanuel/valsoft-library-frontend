import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { libraryKeys } from "@/features/library/query-keys"
import * as libraryRequests from "@/features/library/services/requests"
import type {
  AdminOpenLoansPage,
  BookCopyCreate,
  BookCopyListResponse,
  BookCopyUpdate,
  BookCreate,
  BookListPage,
  BookUpdate,
  CheckoutRequest,
  ClientCreate,
  ClientListPage,
  ClientUpdate,
  ListAdminOpenLoansParams,
  ListBooksParams,
  ListClientsParams,
  ListLoanHistoryParams,
  LoanHistoryPage,
} from "@/features/library/services/types"

export function useBooksQuery(params?: ListBooksParams) {
  return useQuery<BookListPage>({
    queryKey: libraryKeys.books(params),
    queryFn: () => libraryRequests.listBooks(params),
    staleTime: 0,
  })
}

export function useMyLoansQuery(enabled = true) {
  return useQuery({
    queryKey: libraryKeys.loans(),
    queryFn: () => libraryRequests.listMyOpenLoans(),
    enabled,
  })
}

export function useAdminOpenLoansQuery(
  params: ListAdminOpenLoansParams,
  enabled = true,
) {
  return useQuery<AdminOpenLoansPage>({
    queryKey: libraryKeys.adminOpenLoans(params),
    queryFn: () => libraryRequests.listAdminOpenLoans(params),
    staleTime: 0,
    enabled,
  })
}

export function useLoanHistoryQuery(
  params: ListLoanHistoryParams,
  enabled = true,
) {
  return useQuery<LoanHistoryPage>({
    queryKey: libraryKeys.loanHistory(params),
    queryFn: () => libraryRequests.listLoanHistory(params),
    staleTime: 0,
    enabled,
  })
}

export function useClientQuery(clientId: number, enabled = true) {
  return useQuery({
    queryKey: libraryKeys.client(clientId),
    queryFn: () => libraryRequests.getClient(clientId),
    enabled: enabled && clientId > 0,
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
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
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
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
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
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
      void queryClient.invalidateQueries({ queryKey: ["library", "loans", "history"] })
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

export function useBookCopiesQuery(bookId: number, enabled = true) {
  return useQuery<BookCopyListResponse>({
    queryKey: libraryKeys.bookCopies(bookId),
    queryFn: () => libraryRequests.listBookCopies(bookId),
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
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.bookCopies(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: libraryKeys.loans() })
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
      void queryClient.invalidateQueries({ queryKey: ["library", "clients"] })
      void queryClient.invalidateQueries({ queryKey: ["library", "loans", "history"] })
    },
  })
}

export function useCheckinLoanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (loanId: number) => libraryRequests.checkinLoan(loanId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.invalidateQueries({ queryKey: libraryKeys.loans() })
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
      void queryClient.invalidateQueries({ queryKey: ["library", "loans", "history"] })
    },
  })
}

export function useCreateBookCopyMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookCopyCreate) =>
      libraryRequests.createBookCopy(bookId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.book(bookId),
      })
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.bookCopies(bookId),
      })
    },
  })
}

export function useUpdateBookCopyMutation(bookId: number, copyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookCopyUpdate) =>
      libraryRequests.updateBookCopy(copyId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.bookCopies(bookId),
      })
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.book(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
    },
  })
}

export function useDeleteBookCopyMutation(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (copyId: number) => libraryRequests.deleteBookCopy(copyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.bookCopies(bookId),
      })
      void queryClient.invalidateQueries({
        queryKey: libraryKeys.book(bookId),
      })
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
    },
  })
}
