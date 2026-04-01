import axios from "axios"
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
    if (axios.isAxiosError(me.error) && me.error.response?.status === 401) {
      return <Navigate to="/login" replace />
    }
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <p className="text-destructive text-sm">
          Could not verify your session. Try signing in again.
        </p>
      </div>
    )
  }

  return <Outlet />
}
