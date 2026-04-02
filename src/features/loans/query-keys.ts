import type { ListLoanHistoryParams } from "@/features/loans/services/types"

export const loansKeys = {
  loans: () => ["library", "loans"] as const,
  loanHistory: (params?: ListLoanHistoryParams) =>
    [
      "library",
      "loans",
      "history",
      params?.client_id ?? null,
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
}
