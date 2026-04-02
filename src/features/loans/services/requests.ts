import { api } from "@/features/shared/services/client"

import type {
  ListLoanHistoryParams,
  LoanHistoryPage,
  LoanRead,
  MyOpenLoanRead,
} from "./types"

export async function listMyOpenLoans(): Promise<MyOpenLoanRead[]> {
  const { data } = await api.get<MyOpenLoanRead[]>("/library/loans")
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

export async function checkinLoan(loanId: number): Promise<LoanRead> {
  const { data } = await api.post<LoanRead>(`/library/loans/${loanId}/checkin`)
  return data
}
