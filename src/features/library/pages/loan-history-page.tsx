import { useCallback, useEffect, useMemo } from "react"
import { Link, useSearchParams } from "react-router"

import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import { Button } from "@/features/shared/components/ui/button"
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
import { formatLoanDate } from "@/features/library/lib/format-loan-date"
import { useLoanHistoryQuery } from "@/features/library/hooks/use-library-queries"

const DEFAULT_PAGE_SIZE = 20

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10)
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

export function LoanHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePositiveInt(searchParams.get("page"), 1)
  const limit = Math.min(
    100,
    Math.max(1, parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE)),
  )
  const offset = (page - 1) * limit

  const listParams = useMemo(
    () => ({ offset, limit }),
    [offset, limit],
  )

  const historyQuery = useLoanHistoryQuery(listParams)

  const total = historyQuery.data?.total ?? 0
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit)
  const items = historyQuery.data?.items ?? []

  useEffect(() => {
    if (!historyQuery.isSuccess) return
    const t = historyQuery.data?.total ?? 0
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
  }, [historyQuery.isSuccess, historyQuery.data?.total, limit, page, setSearchParams])

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Past returns"
          description="Loans you checked out and have checked in again. Open loans stay on the open loans page."
          className="sm:flex-1"
        />
        <Button variant="outline" size="sm" asChild>
          <Link to="/library/loans">Open loans</Link>
        </Button>
      </div>

      {historyQuery.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : historyQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(historyQuery.error, "Failed to load history")}
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your circulation history</CardTitle>
            <CardDescription>
              Returned items only, newest return first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Copy</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Checked out</TableHead>
                  <TableHead>Returned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      No past returns yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.loan_id}>
                      <TableCell className="max-w-56 min-w-0">
                        <Link
                          to={`/library/books/${row.book_id}`}
                          className="text-primary block truncate font-medium hover:underline"
                          title={row.book_title}
                        >
                          {row.book_title}
                        </Link>
                      </TableCell>
                      <TableCell>{row.book_author}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {row.copy_barcode ?? `#${row.copy_id}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span>{row.client_name ?? "—"}</span>
                          {row.client_email ? (
                            <span className="text-muted-foreground text-xs">
                              {row.client_email}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{formatLoanDate(row.checked_out_at)}</TableCell>
                      <TableCell>
                        {row.returned_at
                          ? formatLoanDate(row.returned_at)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="text-muted-foreground flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p>
                {total === 0
                  ? "No returns in this view."
                  : `Showing ${items.length} of ${total} return${total === 1 ? "" : "s"}.`}
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
