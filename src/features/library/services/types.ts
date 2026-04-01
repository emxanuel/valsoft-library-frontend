export type BookRead = {
  id: number
  title: string
  author: string
  isbn: string | null
  description: string | null
  published_year: number | null
  genre: string | null
  created_at: string
  updated_at: string
  is_checked_out: boolean
}

export type BookCreate = {
  title: string
  author: string
  isbn?: string | null
  description?: string | null
  published_year?: number | null
  genre?: string | null
}

export type BookUpdate = {
  title?: string | null
  author?: string | null
  isbn?: string | null
  description?: string | null
  published_year?: number | null
  genre?: string | null
}

export type CheckoutRequest = {
  due_at?: string | null
}

export type LoanRead = {
  id: number
  book_id: number
  user_id: number
  checked_out_at: string
  due_at: string | null
  returned_at: string | null
}

export type ListBooksParams = {
  q?: string
  genre?: string
}
