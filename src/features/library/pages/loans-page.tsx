import { useMemo } from "react"
import { Link } from "react-router"

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
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import { LoanCheckInButton } from "@/features/library/components/loan-check-in-button"
import { formatLoanDate } from "@/features/library/lib/format-loan-date"
import { useMyLoansQuery } from "@/features/library/hooks/use-library-queries"
import type { MyOpenLoanRead } from "@/features/library/services/types"

function loanStats(loans: MyOpenLoanRead[]) {
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
  const loansQuery = useMyLoansQuery()
  const loans = loansQuery.data ?? []

  const stats = useMemo(
    () => loanStats(loansQuery.data ?? []),
    [loansQuery.data],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My loans</h1>
        <p className="text-muted-foreground text-sm">
          Books you currently have checked out. Return them from here or from
          the book page.
        </p>
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
              Active checkouts on your account.
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
          <CardTitle className="text-base">All open loans</CardTitle>
          <CardDescription>
            Full list with checkout and due times.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Checked out</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      You have no open loans.
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => (
                    <TableRow key={loan.loan_id}>
                      <TableCell>
                        <Link
                          to={`/library/books/${loan.book_id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {loan.book_title}
                        </Link>
                      </TableCell>
                      <TableCell>{loan.book_author}</TableCell>
                      <TableCell>
                        {formatLoanDate(loan.checked_out_at)}
                      </TableCell>
                      <TableCell>
                        {loan.due_at ? formatLoanDate(loan.due_at) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <LoanCheckInButton bookId={loan.book_id} />
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
