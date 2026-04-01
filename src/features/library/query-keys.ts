import type {
  ListBooksParams,
  ListClientsParams,
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
  loans: () => ["library", "loans"] as const,
  clients: (params?: ListClientsParams) =>
    [
      "library",
      "clients",
      params?.q ?? null,
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
}
