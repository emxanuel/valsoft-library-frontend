import { useDeleteStaffMutation } from "@/features/admin/hooks/use-admin-queries"
import type { StaffRead } from "@/features/admin/services/types"
import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import { Button } from "@/features/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/components/ui/dialog"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"

type Props = {
  staff: StaffRead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteStaffDialog({ staff, open, onOpenChange }: Props) {
  const del = useDeleteStaffMutation()

  function confirm() {
    if (!staff) return
    del.mutate(staff.id, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove staff member</DialogTitle>
          <DialogDescription>
            This permanently deletes the account for{" "}
            <strong>{staff?.first_name} {staff?.last_name}</strong> (
            {staff?.email}). They cannot have any loan history.
          </DialogDescription>
        </DialogHeader>
        {del.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {getApiErrorMessage(del.error, "Could not delete staff")}
            </AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirm}
            disabled={del.isPending || !staff}
          >
            {del.isPending ? "Removing…" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
