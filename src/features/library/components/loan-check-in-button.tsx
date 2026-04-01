import { Button } from "@/features/shared/components/ui/button"
import { useCheckinMutation } from "@/features/library/hooks/use-library-queries"

export function LoanCheckInButton({ bookId }: { bookId: number }) {
  const checkin = useCheckinMutation(bookId)
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={checkin.isPending}
      onClick={() => checkin.mutate()}
    >
      {checkin.isPending ? "Returning…" : "Check in"}
    </Button>
  )
}
