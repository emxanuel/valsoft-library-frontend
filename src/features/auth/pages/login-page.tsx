import { Navigate } from "react-router"

import { LoginForm } from "@/features/auth/components/login-form"
import { useMeQuery } from "@/features/auth/hooks/use-auth-queries"

export function LoginPage() {
  const me = useMeQuery(true)

  if (me.isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  if (me.isSuccess) {
    return <Navigate to="/library" replace />
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-12">
      <LoginForm />
    </div>
  )
}
