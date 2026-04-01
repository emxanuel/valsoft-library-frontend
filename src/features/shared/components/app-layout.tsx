import { LogOut, User } from "lucide-react"
import { Link, Outlet, useNavigate } from "react-router"

import { Button } from "@/features/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/shared/components/ui/dropdown-menu"
import { Separator } from "@/features/shared/components/ui/separator"
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-queries"
import { useAuthStore } from "@/features/auth/stores/auth-store"

export function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogoutMutation()
  const navigate = useNavigate()

  return (
    <div className="bg-background min-h-svh flex flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Link
              to="/library"
              className="text-lg font-semibold tracking-tight"
            >
              Library
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <nav className="flex gap-2 text-sm">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/library">Books</Link>
              </Button>
            </nav>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="size-4" />
                <span className="max-w-[12rem] truncate">
                  {user?.email ?? "Account"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-muted-foreground">
                {user?.first_name} {user?.last_name}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  logout.mutate(undefined, {
                    onSettled: () => navigate("/login", { replace: true }),
                  })
                }
                disabled={logout.isPending}
              >
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
