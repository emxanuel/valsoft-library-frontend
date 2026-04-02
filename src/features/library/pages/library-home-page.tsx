import { Link } from "react-router"

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
import { LoanCheckInButton } from "@/features/library/components/loan-check-in-button"
import { formatLoanDate } from "@/features/library/lib/format-loan-date"
import {
  useBooksQuery,
  useMyLoansQuery,
} from "@/features/library/hooks/use-library-queries"

const PREVIEW_LIMIT = 3

export function LibraryHomePage() {
  const booksQuery = useBooksQuery({ limit: PREVIEW_LIMIT, offset: 0 })
  const loansQuery = useMyLoansQuery()

  const previewBooks = booksQuery.data?.items ?? []
  const previewLoans = loansQuery.data?.slice(0, PREVIEW_LIMIT) ?? []
  const totalBooks = booksQuery.data?.total ?? 0
  const totalLoans = loansQuery.data?.length ?? 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Library"
        description="Overview of your catalog and current loans. Open the full lists to search, filter, and manage circulation."
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-lg font-medium">Books</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/library/books">View all books</Link>
          </Button>
        </div>
        {booksQuery.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : booksQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {getApiErrorMessage(booksQuery.error, "Failed to load books")}
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent in catalog</CardTitle>
              <CardDescription>
                First {PREVIEW_LIMIT} titles (alphabetically).{" "}
                {totalBooks > 0
                  ? `${totalBooks} total in catalog.`
                  : "No books yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewBooks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-muted-foreground"
                      >
                        No books in the catalog yet. Add one from the books
                        page.
                      </TableCell>
                    </TableRow>
                  ) : (
                    previewBooks.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <Link
                            to={`/library/books/${b.id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {b.title}
                          </Link>
                        </TableCell>
                        <TableCell>{b.author}</TableCell>
                        <TableCell>{b.genre ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          {b.is_checked_out ? (
                            <span className="text-status-on-loan">
                              Checked out
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Available
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-lg font-medium">Open loans</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/library/loans">View all loans</Link>
          </Button>
        </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open loans</CardTitle>
              <CardDescription>
                Up to {PREVIEW_LIMIT} most recent checkouts.{" "}
                {totalLoans > 0
                  ? `${totalLoans} open loan${totalLoans === 1 ? "" : "s"} total.`
                  : "Nothing checked out for this sign-in."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Checked out</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewLoans.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-muted-foreground"
                      >
                        No open loans.
                      </TableCell>
                    </TableRow>
                  ) : (
                    previewLoans.map((loan) => (
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
                          <LoanCheckInButton bookId={loan.book_id} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
