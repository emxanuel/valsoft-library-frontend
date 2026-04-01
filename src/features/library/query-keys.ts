import type { ListBooksParams } from "@/features/library/services/types"

export const libraryKeys = {
  books: (params?: ListBooksParams) => ["library", "books", params] as const,
  book: (id: number) => ["library", "books", id] as const,
  loans: () => ["library", "loans"] as const,
}
