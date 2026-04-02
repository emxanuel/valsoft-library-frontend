export type BookRead = {
  id: number
  title: string
  author: string
  isbn: string | null
  description: string | null
  published_year: number | null
  genre: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  total_copies: number
  available_copies: number
  is_checked_out: boolean
}

export type BookListPage = {
  items: BookRead[]
  total: number
  limit: number
  offset: number
}

export type BookCreate = {
  title: string
  author: string
  isbn?: string | null
  description?: string | null
  published_year?: number | null
  genre?: string | null
  image_url?: string | null
}

export type BookUpdate = {
  title?: string | null
  author?: string | null
  isbn?: string | null
  description?: string | null
  published_year?: number | null
  genre?: string | null
  image_url?: string | null
}

export type BookAiEnrichRequest = {
  title?: string
  author?: string
  isbn?: string | null
  description?: string | null
  published_year?: number | null
  genre?: string | null
  image_url?: string | null
  /** When editing, exclude this book from duplicate detection */
  exclude_book_id?: number | null
}

export type BookAiEnrichSuggestions = {
  title?: string | null
  author?: string | null
  isbn?: string | null
  description?: string | null
  published_year?: number | null
  genre?: string | null
  image_url?: string | null
}

export type DuplicateCandidate = {
  book_id: number
  title: string
  author: string
  isbn: string | null
  reason: string
}

export type BookAiEnrichResponse = {
  suggestions: BookAiEnrichSuggestions
  duplicate_candidates: DuplicateCandidate[]
  requires_confirmation: boolean
}

export type BookCopyRead = {
  id: number
  book_id: number
  barcode: string | null
  is_checked_out: boolean
  created_at: string
  updated_at: string
}

export type BookCopyListResponse = {
  items: BookCopyRead[]
}

export type BookCopyCreate = {
  barcode?: string | null
}

export type BookCopyUpdate = {
  barcode?: string | null
}

export type ClientCheckout = {
  name: string
  email: string
  phone?: string | null
}

export type CheckoutRequest = {
  due_at?: string | null
  client: ClientCheckout
  copy_id?: number | null
}

export type ListBooksParams = {
  q?: string
  genre?: string
  offset?: number
  limit?: number
}
