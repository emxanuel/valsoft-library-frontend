import type {
  ListAdminOpenLoansParams,
  ListBooksParams,
  ListClientsParams,
  ListLoanHistoryParams,
} from "@/features/library/services/types"

/** Primitives only — avoids subtle cache key mismatches when hashing param objects. */
export const libraryKeys = {
  books: (params?: ListBooksParams) =>
    [
      "library",
      "books",
      params?.q ?? null,
      params?.genre ?? null,
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
  book: (id: number) => ["library", "books", id] as const,
  bookCopies: (bookId: number) => ["library", "books", bookId, "copies"] as const,
  loans: () => ["library", "loans"] as const,
  adminOpenLoans: (params?: ListAdminOpenLoansParams) =>
    [
      "admin",
      "loans",
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
  loanHistory: (params?: ListLoanHistoryParams) =>
    [
      "library",
      "loans",
      "history",
      params?.client_id ?? null,
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
  clients: (params?: ListClientsParams) =>
    [
      "library",
      "clients",
      params?.q ?? null,
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
  client: (id: number) => ["library", "clients", id] as const,
}
