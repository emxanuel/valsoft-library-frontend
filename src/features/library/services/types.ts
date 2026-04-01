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

export type ClientCheckout = {
  name: string
  email: string
  phone?: string | null
}

export type CheckoutRequest = {
  due_at?: string | null
  client: ClientCheckout
}

export type ClientRead = {
  id: number
  name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

export type ClientListPage = {
  items: ClientRead[]
  total: number
  limit: number
  offset: number
}

export type ListClientsParams = {
  q?: string
  offset?: number
  limit?: number
}

export type LoanRead = {
  id: number
  book_id: number
  user_id: number
  client_id: number | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  checked_out_at: string
  due_at: string | null
  returned_at: string | null
}

export type MyOpenLoanRead = {
  loan_id: number
  book_id: number
  book_title: string
  book_author: string
  client_id: number | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  checked_out_at: string
  due_at: string | null
}

export type ListBooksParams = {
  q?: string
  genre?: string
  offset?: number
  limit?: number
}
