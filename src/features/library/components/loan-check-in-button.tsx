import { Button } from "@/features/shared/components/ui/button"
import { useCheckinLoanMutation } from "@/features/library/hooks/use-library-queries"

export function LoanCheckInButton({ loanId }: { loanId: number }) {
  const checkin = useCheckinLoanMutation()
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={checkin.isPending}
      onClick={() => checkin.mutate(loanId)}
    >
      {checkin.isPending ? "Returning…" : "Check in"}
    </Button>
  )
}
