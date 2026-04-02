import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
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
  DialogTrigger,
} from "@/features/shared/components/ui/dialog"
import { Input } from "@/features/shared/components/ui/input"
import { Label } from "@/features/shared/components/ui/label"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import {
  clientCreateSchema,
  type ClientCreateFormValues,
} from "@/features/library/schemas"
import { useCreateClientMutation } from "@/features/library/hooks/use-library-queries"

const emptyValues: ClientCreateFormValues = {
  name: "",
  email: "",
  phone: "",
}

export function CreateClientDialog() {
  const [open, setOpen] = useState(false)
  const create = useCreateClientMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientCreateFormValues>({
    resolver: zodResolver(clientCreateSchema) as Resolver<ClientCreateFormValues>,
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(emptyValues)
    }
  }, [open, reset])

  function resetAndClose() {
    reset(emptyValues)
    setOpen(false)
  }

  function onValid(data: ClientCreateFormValues) {
    const phone = data.phone?.trim()
    create.mutate(
      {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: phone ? phone : undefined,
      },
      { onSuccess: () => resetAndClose() },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onValid)} noValidate>
          <DialogHeader>
            <DialogTitle>Add client</DialogTitle>
            <DialogDescription>
              Create a patron record. Email must be unique (normalized: trim and
              lowercase).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {create.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(create.error, "Could not create client")}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="create-client-name">Name</Label>
              <Input
                id="create-client-name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-client-email">Email</Label>
              <Input
                id="create-client-email"
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
              <Label htmlFor="create-client-phone">Phone (optional)</Label>
              <Input
                id="create-client-phone"
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
