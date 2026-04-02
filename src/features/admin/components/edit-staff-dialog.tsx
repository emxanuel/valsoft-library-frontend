import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { type Resolver, useForm } from "react-hook-form"

import { useUpdateStaffMutation } from "@/features/admin/hooks/use-admin-queries"
import {
  staffUpdateSchema,
  type StaffUpdateFormValues,
} from "@/features/admin/schemas"
import type {
  EmployeeUpdatePayload,
  StaffRead,
} from "@/features/admin/services/types"
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
import { cn } from "@/features/shared/lib/utils"

type Props = {
  staff: StaffRead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditStaffDialog({ staff, open, onOpenChange }: Props) {
  const update = useUpdateStaffMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffUpdateFormValues>({
    resolver: zodResolver(staffUpdateSchema) as Resolver<StaffUpdateFormValues>,
    defaultValues: {},
  })

  const roleValue = watch("role")

  useEffect(() => {
    if (!staff || !open) return
    reset({
      first_name: staff.first_name,
      last_name: staff.last_name,
      email: staff.email,
      password: "",
      role: staff.role,
    })
  }, [staff, open, reset])

  function onValid(data: StaffUpdateFormValues) {
    if (!staff) return
    const payload: EmployeeUpdatePayload = {}
    if (data.first_name !== undefined && data.first_name !== staff.first_name)
      payload.first_name = data.first_name.trim()
    if (data.last_name !== undefined && data.last_name !== staff.last_name)
      payload.last_name = data.last_name.trim()
    if (data.email !== undefined && data.email.trim() !== staff.email)
      payload.email = data.email.trim()
    if (data.password && data.password.length > 0)
      payload.password = data.password
    if (data.role !== undefined && data.role !== staff.role)
      payload.role = data.role

    if (Object.keys(payload).length === 0) {
      onOpenChange(false)
      return
    }

    update.mutate(
      { id: staff.id, payload },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onValid)} noValidate>
          <DialogHeader>
            <DialogTitle>Edit staff</DialogTitle>
            <DialogDescription>
              Update name, email, role, or set a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {update.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(update.error, "Could not update staff")}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="edit-staff-fn">First name</Label>
              <Input
                id="edit-staff-fn"
                aria-invalid={!!errors.first_name}
                {...register("first_name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-staff-ln">Last name</Label>
              <Input
                id="edit-staff-ln"
                aria-invalid={!!errors.last_name}
                {...register("last_name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-staff-email">Email</Label>
              <Input
                id="edit-staff-email"
                type="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-staff-pw">New password (optional)</Label>
              <Input
                id="edit-staff-pw"
                type="password"
                autoComplete="new-password"
                placeholder="Leave blank to keep current"
                {...register("password")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-staff-role">Role</Label>
              <select
                id="edit-staff-role"
                className={cn(
                  "border-input bg-background ring-offset-background",
                  "focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                )}
                value={roleValue ?? staff?.role ?? "employee"}
                onChange={(e) =>
                  setValue("role", e.target.value as "admin" | "employee", {
                    shouldDirty: true,
                  })
                }
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
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
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
