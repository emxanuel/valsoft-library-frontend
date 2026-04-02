import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { type Resolver, useForm } from "react-hook-form"

import { useCreateStaffMutation } from "@/features/admin/hooks/use-admin-queries"
import {
  staffCreateSchema,
  type StaffCreateFormValues,
} from "@/features/admin/schemas"
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

const emptyValues: StaffCreateFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
}

export function CreateStaffDialog() {
  const [open, setOpen] = useState(false)
  const create = useCreateStaffMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffCreateFormValues>({
    resolver: zodResolver(staffCreateSchema) as Resolver<StaffCreateFormValues>,
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

  function onValid(data: StaffCreateFormValues) {
    create.mutate(
      {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        password: data.password,
      },
      { onSuccess: () => resetAndClose() },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onValid)} noValidate>
          <DialogHeader>
            <DialogTitle>Add staff member</DialogTitle>
            <DialogDescription>
              Creates an employee account with the password you set.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {create.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(create.error, "Could not create staff")}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="create-staff-fn">First name</Label>
              <Input
                id="create-staff-fn"
                autoComplete="given-name"
                aria-invalid={!!errors.first_name}
                {...register("first_name")}
              />
              {errors.first_name ? (
                <p className="text-destructive text-sm">
                  {errors.first_name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-staff-ln">Last name</Label>
              <Input
                id="create-staff-ln"
                autoComplete="family-name"
                aria-invalid={!!errors.last_name}
                {...register("last_name")}
              />
              {errors.last_name ? (
                <p className="text-destructive text-sm">
                  {errors.last_name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-staff-email">Email</Label>
              <Input
                id="create-staff-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-staff-pw">Password</Label>
              <Input
                id="create-staff-pw"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-destructive text-sm">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
