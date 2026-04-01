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
    <Card className="border-border/70 bg-card/95 w-full rounded-2xl shadow-xl shadow-primary/[0.06] backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight">
          Create account
        </CardTitle>
        <CardDescription className="text-base leading-relaxed">
          Register library staff access to run the catalog and circulation from
          one place.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
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
                className="h-11"
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
                className="h-11"
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
              autoComplete="new-password"
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
            disabled={register.isPending}
          >
            {register.isPending ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Already registered?{" "}
            <Button variant="link" className="h-auto p-0" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
