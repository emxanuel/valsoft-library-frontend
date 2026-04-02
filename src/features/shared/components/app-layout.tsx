import { LogOut, Menu, User, X } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router"

import { Button } from "@/features/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/shared/components/ui/dropdown-menu"
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-queries"
import { useAuthStore } from "@/features/auth/stores/auth-store"
import { APP_NAME } from "@/features/shared/constants/branding"
import { useDocumentTitle } from "@/features/shared/hooks/use-document-title"
import { cn } from "@/features/shared/lib/utils"

function documentTitleForAppPath(pathname: string): string {
  if (pathname === "/library") return `Overview | ${APP_NAME}`
  if (pathname === "/library/books") return `Books | ${APP_NAME}`
  if (pathname === "/library/loans/history") return `Past returns | ${APP_NAME}`
  if (pathname === "/library/loans") return `Open loans | ${APP_NAME}`
  if (pathname === "/library/clients") return `Clients | ${APP_NAME}`
  if (/^\/library\/clients\/[^/]+$/.test(pathname)) return `Client | ${APP_NAME}`
  if (/^\/library\/books\/[^/]+$/.test(pathname)) return `Book | ${APP_NAME}`
  if (pathname === "/admin/employees") return `Staff | ${APP_NAME}`
  return APP_NAME
}

const libraryNavItems = [
  { to: "/library", label: "Overview", end: true },
  { to: "/library/books", label: "Books", end: false },
  { to: "/library/loans", label: "Loans", end: false },
  { to: "/library/clients", label: "Clients", end: false },
] as const

const adminNavItem = {
  to: "/admin/employees",
  label: "Staff",
  end: false,
} as const

function navLinkClassName({
  isActive,
}: {
  isActive: boolean
}) {
  return cn(
    "block rounded-md px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
  )
}

function AccountMenu({ align = "end" }: { align?: "start" | "end" }) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogoutMutation()
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 lg:w-auto"
        >
          <User className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left">
            {user?.email ?? "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
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
  )
}

function SidebarNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin")
  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {libraryNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={navLinkClassName}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
      {isAdmin ? (
        <NavLink
          to={adminNavItem.to}
          end={adminNavItem.end}
          className={navLinkClassName}
          onClick={onNavigate}
        >
          {adminNavItem.label}
        </NavLink>
      ) : null}
    </nav>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useDocumentTitle(documentTitleForAppPath(location.pathname))

  useEffect(() => {
    // Close drawer when navigation completes (e.g. links in main content).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync UI to external route
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="bg-background flex min-h-svh flex-col lg:h-svh lg:max-h-svh lg:flex-row lg:overflow-hidden">
      <header className="border-sidebar-border bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 backdrop-blur lg:hidden">
        <Link
          to="/library"
          className="font-heading text-primary min-w-0 max-w-[min(70vw,14rem)] text-xl font-semibold tracking-tight"
        >
          {APP_NAME}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </header>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/25 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-nav"
            className="border-sidebar-border bg-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r shadow-lg lg:hidden"
          >
            <div className="border-sidebar-border flex h-14 items-center border-b px-4">
              <Link
                to="/library"
                className="font-heading text-primary min-w-0 max-w-[min(70vw,14rem)] text-xl font-semibold tracking-tight"
                onClick={() => setMobileOpen(false)}
              >
                {APP_NAME}
              </Link>
            </div>
            <div className="flex flex-1 flex-col gap-6 p-4">
              <SidebarNav />
              <div className="mt-auto border-sidebar-border border-t pt-4">
                <AccountMenu align="start" />
              </div>
            </div>
          </div>
        </>
      ) : null}

      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground hidden h-auto w-64 shrink-0 flex-col border-r lg:flex lg:h-full lg:max-h-none lg:overflow-y-auto">
        <div className="border-sidebar-border flex flex-col gap-1 border-b px-5 py-8">
          <Link
            to="/library"
            className="font-heading text-primary text-2xl font-semibold leading-tight tracking-tight"
          >
            {APP_NAME}
          </Link>
          <p className="text-muted-foreground text-xs leading-snug">
            Catalog & circulation
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-6 px-3 py-6">
          <SidebarNav className="px-2" />
          <div className="mt-auto border-sidebar-border border-t px-2 pt-6">
            <AccountMenu />
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 lg:mr-auto lg:ml-0 lg:max-w-4xl lg:pl-10 lg:pr-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
