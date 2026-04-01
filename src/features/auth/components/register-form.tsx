import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
  const registerMutation = useRegisterMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  })

  function onValid(data: RegisterFormValues) {
    registerMutation.mutate(data, {
      onSuccess: () => navigate("/login", { replace: true }),
    })
  }

  const submitError =
    registerMutation.isError && axios.isAxiosError(registerMutation.error)
      ? getApiErrorMessage(registerMutation.error, "Registration failed")
      : registerMutation.isError
        ? getApiErrorMessage(registerMutation.error)
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
      <form onSubmit={handleSubmit(onValid)} noValidate>
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
                aria-invalid={!!errors.first_name}
                className="h-11"
                {...register("first_name")}
              />
              {errors.first_name ? (
                <p className="text-destructive text-sm">
                  {errors.first_name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                autoComplete="family-name"
                aria-invalid={!!errors.last_name}
                className="h-11"
                {...register("last_name")}
              />
              {errors.last_name ? (
                <p className="text-destructive text-sm">
                  {errors.last_name.message}
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
              aria-invalid={!!errors.email}
              className="h-11"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="h-11"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating account…" : "Create account"}
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
