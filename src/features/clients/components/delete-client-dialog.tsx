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
import { useDeleteClientMutation } from "@/features/clients/hooks/use-clients-queries"
import type { ClientRead } from "@/features/clients/services/types"

export function DeleteClientDialog({
  client,
  open,
  onOpenChange,
  onDeleted,
}: {
  client: ClientRead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  const del = useDeleteClientMutation()
  const name = client?.name ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete client</DialogTitle>
          <DialogDescription>
            Remove “{name}” from the directory? This is only allowed when the
            patron has no loan history (no checkouts recorded).
          </DialogDescription>
        </DialogHeader>
        {del.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {getApiErrorMessage(del.error, "Could not delete client")}
            </AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!client || del.isPending}
            onClick={() => {
              if (!client) return
              del.mutate(client.id, { onSuccess: onDeleted })
            }}
          >
            {del.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
