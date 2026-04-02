export type LoanRead = {
  id: number
  book_id: number
  copy_id: number
  copy_barcode: string | null
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
  copy_id: number
  copy_barcode: string | null
  book_title: string
  book_author: string
  client_id: number | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  checked_out_at: string
  due_at: string | null
}

export type LoanHistoryRead = {
  loan_id: number
  book_id: number
  copy_id: number
  copy_barcode: string | null
  book_title: string
  book_author: string
  client_id: number | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  checked_out_at: string
  due_at: string | null
  returned_at: string | null
  staff_email: string | null
}

export type LoanHistoryPage = {
  items: LoanHistoryRead[]
  total: number
  limit: number
  offset: number
}

export type ListLoanHistoryParams = {
  client_id?: number
  offset?: number
  limit?: number
}
