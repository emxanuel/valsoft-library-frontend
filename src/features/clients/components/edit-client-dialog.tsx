import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { type Resolver, useForm } from "react-hook-form"

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
import { Input } from "@/features/shared/components/ui/input"
import { Label } from "@/features/shared/components/ui/label"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import { useUpdateClientMutation } from "@/features/clients/hooks/use-clients-queries"
import {
  clientEditSchema,
  type ClientEditFormValues,
} from "@/features/clients/schemas"
import type { ClientRead } from "@/features/clients/services/types"

export function EditClientDialog({
  client,
  open,
  onOpenChange,
}: {
  client: ClientRead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const clientId = client?.id ?? 0
  const update = useUpdateClientMutation(clientId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientEditFormValues>({
    resolver: zodResolver(clientEditSchema) as Resolver<ClientEditFormValues>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  useEffect(() => {
    if (open && client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone ?? "",
      })
    }
  }, [open, client, reset])

  function onValid(data: ClientEditFormValues) {
    if (!client) return
    const phoneTrim = data.phone?.trim()
    update.mutate(
      {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: phoneTrim === undefined || phoneTrim === "" ? null : phoneTrim,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onValid)} noValidate>
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
            <DialogDescription>
              Update patron details. Changing email must not match another
              client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {update.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(update.error, "Could not update client")}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="edit-client-name">Name</Label>
              <Input
                id="edit-client-name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client-email">Email</Label>
              <Input
                id="edit-client-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client-phone">Phone (optional)</Label>
              <Input
                id="edit-client-phone"
                type="tel"
                autoComplete="tel"
                {...register("phone")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending || !client}>
              {update.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
