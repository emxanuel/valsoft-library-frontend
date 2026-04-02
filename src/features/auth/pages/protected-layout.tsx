import { Navigate, Outlet } from "react-router"

import { Skeleton } from "@/features/shared/components/ui/skeleton"
import { useMeQuery } from "@/features/auth/hooks/use-auth-queries"

export function ProtectedLayout() {
  const me = useMeQuery(true)

  if (me.isPending) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  if (me.isError) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
