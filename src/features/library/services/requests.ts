import { api } from "@/features/shared/services/client"
import type {
  BookAiEnrichRequest,
  BookAiEnrichResponse,
  BookCopyCreate,
  BookCopyListResponse,
  BookCopyRead,
  BookCopyUpdate,
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
  AdminOpenLoansPage,
  ListAdminOpenLoansParams,
  ListLoanHistoryParams,
  LoanHistoryPage,
  LoanRead,
  MyOpenLoanRead,
} from "./types"

export async function listMyOpenLoans(): Promise<MyOpenLoanRead[]> {
  const { data } = await api.get<MyOpenLoanRead[]>("/library/loans")
  return data
}

export async function listAdminOpenLoans(
  params?: ListAdminOpenLoansParams,
): Promise<AdminOpenLoansPage> {
  const { data } = await api.get<AdminOpenLoansPage>("/admin/loans", {
    params,
  })
  return data
}

export async function listLoanHistory(
  params?: ListLoanHistoryParams,
): Promise<LoanHistoryPage> {
  const { data } = await api.get<LoanHistoryPage>("/library/loans/history", {
    params,
  })
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

export async function enrichBook(
  payload: BookAiEnrichRequest,
): Promise<BookAiEnrichResponse> {
  const { data } = await api.post<BookAiEnrichResponse>(
    "/library/books/ai/enrich",
    payload,
  )
  return data
}

export type BookAiEnrichProgress = {
  step: string
  message: string | null
}

/**
 * Same outcome as {@link enrichBook}, but uses a WebSocket for live progress updates
 * (requires session cookie; same origin as the API in dev via Vite proxy).
 */
export function enrichBookWithProgress(
  payload: BookAiEnrichRequest,
  onProgress: (p: BookAiEnrichProgress) => void,
): Promise<BookAiEnrichResponse> {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
  const url = `${proto}//${window.location.host}/library/books/ai/enrich/stream`

  return new Promise((resolve, reject) => {
    let settled = false
    const ws = new WebSocket(url)

    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      fn()
    }

    ws.onopen = () => {
      ws.send(JSON.stringify(payload))
    }

    ws.onmessage = (event) => {
      let parsed: unknown
      try {
        parsed = JSON.parse(String(event.data))
      } catch {
        finish(() => reject(new Error("Invalid server message")))
        ws.close()
        return
      }
      if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
        finish(() => reject(new Error("Invalid server message")))
        ws.close()
        return
      }
      const m = parsed as {
        type: string
        step?: string
        message?: string | null
        data?: BookAiEnrichResponse
        detail?: string
      }
      if (m.type === "progress") {
        onProgress({
          step: m.step ?? "",
          message: m.message ?? null,
        })
        return
      }
      if (m.type === "result" && m.data !== undefined) {
        const data = m.data
        finish(() => resolve(data))
        ws.close()
        return
      }
      if (m.type === "error") {
        finish(() =>
          reject(new Error(m.detail ?? "AI enrichment failed")),
        )
        ws.close()
      }
    }

    ws.onerror = () => {
      finish(() => reject(new Error("WebSocket connection failed")))
    }

    ws.onclose = (ev) => {
      if (!settled) {
        finish(() =>
          reject(
            new Error(
              ev.reason ||
                `Connection closed (${ev.code}) before a result was received`,
            ),
          ),
        )
      }
    }
  })
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

export async function listBookCopies(bookId: number): Promise<BookCopyListResponse> {
  const { data } = await api.get<BookCopyListResponse>(
    `/library/books/${bookId}/copies`,
  )
  return data
}

export async function createBookCopy(
  bookId: number,
  payload: BookCopyCreate,
): Promise<BookCopyRead> {
  const { data } = await api.post<BookCopyRead>(
    `/library/books/${bookId}/copies`,
    payload,
  )
  return data
}

export async function updateBookCopy(
  copyId: number,
  payload: BookCopyUpdate,
): Promise<BookCopyRead> {
  const { data } = await api.patch<BookCopyRead>(
    `/library/copies/${copyId}`,
    payload,
  )
  return data
}

export async function deleteBookCopy(copyId: number): Promise<void> {
  await api.delete(`/library/copies/${copyId}`)
}

export async function checkinLoan(loanId: number): Promise<LoanRead> {
  const { data } = await api.post<LoanRead>(`/library/loans/${loanId}/checkin`)
  return data
}
