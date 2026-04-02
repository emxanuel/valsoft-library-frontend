import { useCallback, useEffect, useMemo } from "react"
import { Link, useSearchParams } from "react-router"

import { Button } from "@/features/shared/components/ui/button"

import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/shared/components/ui/card"
import { Skeleton } from "@/features/shared/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/shared/components/ui/table"
import { PageHeader } from "@/features/shared/components/page-header"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import { useAuthStore } from "@/features/auth/stores/auth-store"
import { LoanCheckInButton } from "@/features/library/components/loan-check-in-button"
import { formatLoanDate } from "@/features/library/lib/format-loan-date"
import {
  useAdminOpenLoansQuery,
  useMyLoansQuery,
} from "@/features/library/hooks/use-library-queries"
import type { AdminOpenLoanRead, MyOpenLoanRead } from "@/features/library/services/types"

const DEFAULT_PAGE_SIZE = 20

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10)
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

function loanStats(loans: { due_at: string | null }[]) {
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  let overdue = 0
  let dueSoon = 0
  for (const loan of loans) {
    if (!loan.due_at) continue
    const due = new Date(loan.due_at).getTime()
    if (Number.isNaN(due)) continue
    if (due < now) overdue += 1
    else if (due <= now + weekMs) dueSoon += 1
  }
  return { total: loans.length, overdue, dueSoon }
}

export function LoansPage() {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin")
  const currentUserId = useAuthStore((s) => s.user?.id)

  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePositiveInt(searchParams.get("page"), 1)
  const limit = Math.min(
    100,
    Math.max(1, parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE)),
  )
  const offset = (page - 1) * limit

  const adminListParams = useMemo(
    () => ({ offset, limit }),
    [offset, limit],
  )

  const myLoansQuery = useMyLoansQuery(!isAdmin)
  const adminLoansQuery = useAdminOpenLoansQuery(adminListParams, isAdmin)

  const loansQuery = isAdmin ? adminLoansQuery : myLoansQuery

  const employeeLoans: MyOpenLoanRead[] = myLoansQuery.data ?? []
  const adminPage = adminLoansQuery.data
  const adminLoans: AdminOpenLoanRead[] = adminPage?.items ?? []

  const loansForStats = isAdmin ? adminLoans : employeeLoans
  const stats = useMemo(() => loanStats(loansForStats), [loansForStats])

  const total = isAdmin ? (adminPage?.total ?? 0) : employeeLoans.length
  const totalPages = isAdmin
    ? total === 0
      ? 1
      : Math.ceil(total / limit)
    : 1

  useEffect(() => {
    if (!isAdmin || !adminLoansQuery.isSuccess) return
    const t = adminPage?.total ?? 0
    if (t === 0) return
    const maxPage = Math.ceil(t / limit)
    if (page > maxPage) {
      setSearchParams((prev) => {
        const n = new URLSearchParams(prev)
        if (maxPage <= 1) n.delete("page")
        else n.set("page", String(maxPage))
        return n
      })
    }
  }, [
    adminLoansQuery.isSuccess,
    adminPage?.total,
    isAdmin,
    limit,
    page,
    setSearchParams,
  ])

  const goToPage = useCallback(
    (next: number) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        if (next <= 1) {
          nextParams.delete("page")
        } else {
          nextParams.set("page", String(next))
        }
        return nextParams
      })
    },
    [setSearchParams],
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Open loans"
          description={
            isAdmin
              ? "All active checkouts across the library, with the staff member who checked out each item."
              : "Checkouts recorded for your staff sign-in. Process returns here or from the book page."
          }
          className="sm:flex-1"
        />
        <Button variant="outline" size="sm" asChild>
          <Link to="/library/loans/history">Past returns</Link>
        </Button>
      </div>

      {loansQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : loansQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(loansQuery.error, "Failed to load loans")}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Open loans</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {stats.total}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              {isAdmin
                ? "Total active checkouts in the library."
                : "Total active checkouts."}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Overdue</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {stats.overdue}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Loans past their due date.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Due within 7 days</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {stats.dueSoon}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Not yet overdue, due soon.
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isAdmin ? "All open loans" : "Your open loans"}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Newest checkouts first. Use check in only for loans you checked out."
              : "Full list with checkout and due times."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {loansQuery.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : loansQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {getApiErrorMessage(loansQuery.error, "Failed to load loans")}
              </AlertDescription>
            </Alert>
          ) : isAdmin ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Copy</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Checked out</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground">
                        No open loans.
                      </TableCell>
                    </TableRow>
                  ) : (
                    adminLoans.map((loan) => (
                      <TableRow key={loan.loan_id}>
                        <TableCell className="max-w-56 min-w-0">
                          <Link
                            to={`/library/books/${loan.book_id}`}
                            className="text-primary block truncate font-medium hover:underline"
                            title={loan.book_title}
                          >
                            {loan.book_title}
                          </Link>
                        </TableCell>
                        <TableCell>{loan.book_author}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {loan.copy_barcode ?? `#${loan.copy_id}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span>
                              {loan.staff_first_name} {loan.staff_last_name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {loan.staff_email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span>{loan.client_name ?? "—"}</span>
                            {loan.client_email ? (
                              <span className="text-muted-foreground text-xs">
                                {loan.client_email}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatLoanDate(loan.checked_out_at)}
                        </TableCell>
                        <TableCell>
                          {loan.due_at ? formatLoanDate(loan.due_at) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {currentUserId !== undefined &&
                          loan.staff_user_id === currentUserId ? (
                            <LoanCheckInButton loanId={loan.loan_id} />
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Only assigning staff can check in here.
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="text-muted-foreground flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p>
                  {total === 0
                    ? "No loans in this view."
                    : `Showing ${adminLoans.length} of ${total} loan${total === 1 ? "" : "s"}.`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="tabular-nums">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Copy</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Checked out</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      No open loans.
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeLoans.map((loan) => (
                    <TableRow key={loan.loan_id}>
                      <TableCell className="max-w-56 min-w-0">
                        <Link
                          to={`/library/books/${loan.book_id}`}
                          className="text-primary block truncate font-medium hover:underline"
                          title={loan.book_title}
                        >
                          {loan.book_title}
                        </Link>
                      </TableCell>
                      <TableCell>{loan.book_author}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {loan.copy_barcode ?? `#${loan.copy_id}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span>{loan.client_name ?? "—"}</span>
                          {loan.client_email ? (
                            <span className="text-muted-foreground text-xs">
                              {loan.client_email}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatLoanDate(loan.checked_out_at)}
                      </TableCell>
                      <TableCell>
                        {loan.due_at ? formatLoanDate(loan.due_at) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <LoanCheckInButton loanId={loan.loan_id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
