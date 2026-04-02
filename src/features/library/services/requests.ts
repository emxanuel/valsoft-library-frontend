import { api } from "@/features/shared/services/client"
import type {
  BookCreate,
  BookListPage,
  BookRead,
  BookUpdate,
  CheckoutRequest,
  ClientCreate,
  ClientListPage,
  ClientRead,
  ClientUpdate,
  ListBooksParams,
  ListClientsParams,
  LoanRead,
  MyOpenLoanRead,
} from "./types"

export async function listMyOpenLoans(): Promise<MyOpenLoanRead[]> {
  const { data } = await api.get<MyOpenLoanRead[]>("/library/loans")
  return data
}

export async function listBooks(params?: ListBooksParams): Promise<BookListPage> {
  const { data } = await api.get<BookListPage>("/library/books", { params })
  return data
}

export async function listClients(
  params?: ListClientsParams,
): Promise<ClientListPage> {
  const { data } = await api.get<ClientListPage>("/library/clients", {
    params,
  })
  return data
}

export async function createClient(payload: ClientCreate): Promise<ClientRead> {
  const { data } = await api.post<ClientRead>("/library/clients", payload)
  return data
}

export async function getClient(clientId: number): Promise<ClientRead> {
  const { data } = await api.get<ClientRead>(`/library/clients/${clientId}`)
  return data
}

export async function updateClient(
  clientId: number,
  payload: ClientUpdate,
): Promise<ClientRead> {
  const { data } = await api.patch<ClientRead>(
    `/library/clients/${clientId}`,
    payload,
  )
  return data
}

export async function deleteClient(clientId: number): Promise<void> {
  await api.delete(`/library/clients/${clientId}`)
}

export async function createBook(payload: BookCreate): Promise<BookRead> {
  const { data } = await api.post<BookRead>("/library/books", payload)
  return data
}

export async function getBook(bookId: number): Promise<BookRead> {
  const { data } = await api.get<BookRead>(`/library/books/${bookId}`)
  return data
}

export async function updateBook(
  bookId: number,
  payload: BookUpdate,
): Promise<BookRead> {
  const { data } = await api.patch<BookRead>(`/library/books/${bookId}`, payload)
  return data
}

export async function deleteBook(bookId: number): Promise<void> {
  await api.delete(`/library/books/${bookId}`)
}

export async function checkoutBook(
  bookId: number,
  payload: CheckoutRequest,
): Promise<LoanRead> {
  const { data } = await api.post<LoanRead>(
    `/library/books/${bookId}/checkout`,
    payload,
  )
  return data
}

export async function checkinBook(bookId: number): Promise<LoanRead> {
  const { data } = await api.post<LoanRead>(`/library/books/${bookId}/checkin`)
  return data
}
