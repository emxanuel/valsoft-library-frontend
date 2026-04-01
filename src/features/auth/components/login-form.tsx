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
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas"
import { useLoginMutation } from "@/features/auth/hooks/use-auth-queries"

export function LoginForm() {
  const navigate = useNavigate()
  const login = useLoginMutation()
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      const next: Partial<Record<keyof LoginFormValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === "email" || key === "password") {
          next[key] = issue.message
        }
      }
      setFieldErrors(next)
      return
    }
    login.mutate(parsed.data, {
      onSuccess: () => navigate("/library", { replace: true }),
    })
  }

  const submitError =
    login.isError && axios.isAxiosError(login.error)
      ? getApiErrorMessage(login.error, "Login failed")
      : login.isError
        ? getApiErrorMessage(login.error)
        : null

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use the email and password for your library account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {submitError ? (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}
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
              autoComplete="current-password"
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
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
          <Button variant="link" className="px-0" asChild>
            <Link to="/register">Create an account</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
