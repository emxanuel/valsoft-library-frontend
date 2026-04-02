import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { loansKeys } from "@/features/loans/query-keys"
import * as loansRequests from "@/features/loans/services/requests"
import type {
  ListLoanHistoryParams,
  LoanHistoryPage,
} from "@/features/loans/services/types"

export function useMyLoansQuery(enabled = true) {
  return useQuery({
    queryKey: loansKeys.loans(),
    queryFn: () => loansRequests.listMyOpenLoans(),
    enabled,
  })
}

export function useLoanHistoryQuery(
  params: ListLoanHistoryParams,
  enabled = true,
) {
  return useQuery<LoanHistoryPage>({
    queryKey: loansKeys.loanHistory(params),
    queryFn: () => loansRequests.listLoanHistory(params),
    staleTime: 0,
    enabled,
  })
}

export function useCheckinLoanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (loanId: number) => loansRequests.checkinLoan(loanId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["library", "books"] })
      void queryClient.invalidateQueries({ queryKey: loansKeys.loans() })
      void queryClient.invalidateQueries({ queryKey: ["admin", "loans"] })
      void queryClient.invalidateQueries({ queryKey: ["library", "loans", "history"] })
    },
  })
}
