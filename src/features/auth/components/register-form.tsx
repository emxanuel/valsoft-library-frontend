import axios from "axios"
import { useState } from "react"
import { Link, useNavigate } from "react-router"

import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import { Button } from "@/features/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/features/shared/components/ui/card"
import { Input } from "@/features/shared/components/ui/input"
import { Label } from "@/features/shared/components/ui/label"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas"
import { useRegisterMutation } from "@/features/auth/hooks/use-auth-queries"

export function RegisterForm() {
  const navigate = useNavigate()
  const register = useRegisterMutation()
  const [values, setValues] = useState<RegisterFormValues>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      const next: Partial<Record<keyof RegisterFormValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (
          key === "first_name" ||
          key === "last_name" ||
          key === "email" ||
          key === "password"
        ) {
          next[key] = issue.message
        }
      }
      setFieldErrors(next)
      return
    }
    register.mutate(parsed.data, {
      onSuccess: () => navigate("/login", { replace: true }),
    })
  }

  const submitError =
    register.isError && axios.isAxiosError(register.error)
      ? getApiErrorMessage(register.error, "Registration failed")
      : register.isError
        ? getApiErrorMessage(register.error)
        : null

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Register to borrow and manage books.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {submitError ? (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                autoComplete="given-name"
                value={values.first_name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, first_name: e.target.value }))
                }
                aria-invalid={!!fieldErrors.first_name}
              />
              {fieldErrors.first_name ? (
                <p className="text-destructive text-sm">
                  {fieldErrors.first_name}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                autoComplete="family-name"
                value={values.last_name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, last_name: e.target.value }))
                }
                aria-invalid={!!fieldErrors.last_name}
              />
              {fieldErrors.last_name ? (
                <p className="text-destructive text-sm">
                  {fieldErrors.last_name}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) =>
                setValues((v) => ({ ...v, email: e.target.value }))
              }
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email ? (
              <p className="text-destructive text-sm">{fieldErrors.email}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) =>
                setValues((v) => ({ ...v, password: e.target.value }))
              }
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password ? (
              <p className="text-destructive text-sm">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Button type="submit" disabled={register.isPending}>
            {register.isPending ? "Creating account…" : "Register"}
          </Button>
          <Button variant="link" className="px-0" asChild>
            <Link to="/login">Already have an account? Sign in</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
