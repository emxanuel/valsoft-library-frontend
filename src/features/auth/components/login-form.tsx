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
    <Card className="border-border/70 bg-card/95 w-full rounded-2xl shadow-xl shadow-primary/[0.06] backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription className="text-base leading-relaxed">
          Enter the email and password for your library account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
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
              className="h-11"
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
              className="h-11"
            />
            {fieldErrors.password ? (
              <p className="text-destructive text-sm">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            No account yet?{" "}
            <Button variant="link" className="h-auto p-0" asChild>
              <Link to="/register">Create one</Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
