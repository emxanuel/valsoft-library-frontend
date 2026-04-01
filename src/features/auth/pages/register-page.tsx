import { Navigate } from "react-router"

import { RegisterForm } from "@/features/auth/components/register-form"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"
import { useMeQuery } from "@/features/auth/hooks/use-auth-queries"
import { APP_NAME } from "@/features/shared/constants/branding"
import { useDocumentTitle } from "@/features/shared/hooks/use-document-title"

function RegisterPageContent() {
  useDocumentTitle(`Register | ${APP_NAME}`)
  return (
    <AuthPageShell lead="Create a staff account to manage the catalog and circulation.">
      <RegisterForm />
    </AuthPageShell>
  )
}

export function RegisterPage() {
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

  return <RegisterPageContent />
}
