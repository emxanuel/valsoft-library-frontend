import { useCallback, useEffect, useMemo, useState } from "react"
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
import { PageHeader } from "@/features/shared/components/page-header"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import { CreateBookDialog } from "@/features/library/components/create-book-dialog"
import { LibrarySearchFilters } from "@/features/library/components/library-search-filters"
import { useBooksQuery } from "@/features/library/hooks/use-library-queries"

const DEFAULT_PAGE_SIZE = 20

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10)
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

export function BooksListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get("q") ?? undefined
  const genre = searchParams.get("genre") ?? undefined
  const page = parsePositiveInt(searchParams.get("page"), 1)
  const limit = Math.min(
    100,
    Math.max(1, parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE)),
  )
  const offset = (page - 1) * limit

  const listParams = useMemo(() => {
    const p: {
      q?: string
      genre?: string
      offset: number
      limit: number
    } = { offset, limit }
    if (q) p.q = q
    if (genre) p.genre = genre
    return p
  }, [q, genre, offset, limit])

  const booksQuery = useBooksQuery(listParams)

  const total = booksQuery.data?.total ?? 0
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit)
  const items = booksQuery.data?.items ?? []

  useEffect(() => {
    if (!booksQuery.isSuccess) return
    const t = booksQuery.data?.total ?? 0
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
  }, [booksQuery.isSuccess, booksQuery.data?.total, limit, page, setSearchParams])

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
          title="Books"
          description="Search the catalog, add titles, open a book for details and circulation."
          className="sm:flex-1"
        />
        <CreateBookDialog />
      </div>

      <LibrarySearchFilters />

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
          <CardContent className="space-y-4 pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      No books match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="w-14">
                        <BookRowThumb url={b.image_url} />
                      </TableCell>
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
            <div className="text-muted-foreground flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p>
                {total === 0
                  ? "No books in this view."
                  : `Showing ${items.length} of ${total} book${total === 1 ? "" : "s"}.`}
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

function BookRowThumb({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <img
      src={url}
      alt=""
      className="size-11 rounded-sm object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
