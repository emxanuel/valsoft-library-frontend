import { Link } from "react-router"

import { APP_NAME } from "@/features/shared/constants/branding"

type AuthPageShellProps = {
  children: React.ReactNode
  lead: string
}

export function AuthPageShell({ children, lead }: AuthPageShellProps) {
  return (
    <div className="bg-background relative min-h-svh">
      <div
        className="absolute inset-0 bg-gradient-to-br from-muted/70 via-background to-muted/45"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_55%)]"
        aria-hidden
      />

      <div className="relative grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <aside className="border-sidebar-border bg-sidebar/90 relative hidden flex-col justify-between border-r px-10 py-12 lg:flex xl:px-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 11px,
                color-mix(in oklch, var(--border) 55%, transparent) 11px,
                color-mix(in oklch, var(--border) 55%, transparent) 12px
              )`,
            }}
            aria-hidden
          />
          <div className="relative space-y-6">
            <Link
              to="/library"
              className="font-heading text-primary block text-3xl font-semibold tracking-tight xl:text-4xl"
            >
              {APP_NAME}
            </Link>
            <div className="border-primary/25 max-w-sm border-l-2 pl-5">
              <p className="text-foreground/95 text-lg font-medium leading-snug xl:text-xl">
                {lead}
              </p>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                Manage the catalog, checkouts, and circulation from one staff
                workspace.
              </p>
            </div>
          </div>
          <p className="text-muted-foreground relative text-xs">
            Secure sign-in for library staff.
          </p>
        </aside>

        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-14 xl:px-16">
          <div className="mb-8 text-center lg:hidden">
            <Link
              to="/library"
              className="font-heading text-primary text-2xl font-semibold tracking-tight"
            >
              {APP_NAME}
            </Link>
            <p className="text-muted-foreground mt-1 text-sm">{lead}</p>
          </div>
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
