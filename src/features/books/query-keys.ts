import type { ListBooksParams } from "@/features/books/services/types"

/** Primitives only — avoids subtle cache key mismatches when hashing param objects. */
export const booksKeys = {
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
}
