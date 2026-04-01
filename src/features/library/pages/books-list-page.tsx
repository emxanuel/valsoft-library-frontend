import { useMemo } from "react"
import { Link, useSearchParams } from "react-router"

import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import { Button } from "@/features/shared/components/ui/button"
import { Card, CardContent } from "@/features/shared/components/ui/card"
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
import { CreateBookDialog } from "@/features/library/components/create-book-dialog"
import { LibrarySearchFilters } from "@/features/library/components/library-search-filters"
import { useBooksQuery } from "@/features/library/hooks/use-library-queries"

export function BooksListPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get("q") ?? undefined
  const genre = searchParams.get("genre") ?? undefined

  const listParams = useMemo(() => {
    const p: { q?: string; genre?: string } = {}
    if (q) p.q = q
    if (genre) p.genre = genre
    return Object.keys(p).length ? p : undefined
  }, [q, genre])

  const booksQuery = useBooksQuery(listParams)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Books</h1>
          <p className="text-muted-foreground text-sm">
            Search the catalog, add titles, open a book for details and
            circulation.
          </p>
        </div>
        <CreateBookDialog />
      </div>

      <LibrarySearchFilters
        key={searchParams.toString()}
        initialQ={q ?? ""}
        initialGenre={genre ?? ""}
      />

      {booksQuery.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
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
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booksQuery.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No books match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  booksQuery.data?.map((b) => (
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
                          <span className="text-amber-600 dark:text-amber-400">
                            Checked out
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Available
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/library/books/${b.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
