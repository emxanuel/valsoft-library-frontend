import { useCallback, useEffect, useMemo, type FormEvent } from "react"
import { useSearchParams } from "react-router"

import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import { Button } from "@/features/shared/components/ui/button"
import { Card, CardContent } from "@/features/shared/components/ui/card"
import { Input } from "@/features/shared/components/ui/input"
import { Label } from "@/features/shared/components/ui/label"
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
import { useClientsQuery } from "@/features/library/hooks/use-library-queries"

const DEFAULT_PAGE_SIZE = 20

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10)
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

export function ClientsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get("q") ?? undefined
  const page = parsePositiveInt(searchParams.get("page"), 1)
  const limit = Math.min(
    100,
    Math.max(1, parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE)),
  )
  const offset = (page - 1) * limit

  const defaultQ = q ?? ""
  const searchFormKey = defaultQ

  const listParams = useMemo(() => {
    const p: { q?: string; offset: number; limit: number } = { offset, limit }
    if (q) p.q = q
    return p
  }, [q, offset, limit])

  const clientsQuery = useClientsQuery(listParams)

  const total = clientsQuery.data?.total ?? 0
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit)
  const items = clientsQuery.data?.items ?? []

  useEffect(() => {
    if (!clientsQuery.isSuccess) return
    const t = clientsQuery.data?.total ?? 0
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
  }, [clientsQuery.isSuccess, clientsQuery.data?.total, limit, page, setSearchParams])

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

  function applySearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const raw = String(fd.get("q") ?? "").trim()
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev)
      if (raw) n.set("q", raw)
      else n.delete("q")
      n.delete("page")
      return n
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clients"
        description="Patrons recorded at checkout. Emails are matched so repeat borrowers update the same row."
      />

      <form
        key={searchFormKey}
        onSubmit={applySearch}
        className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Label htmlFor="client-search">Search name or email</Label>
          <Input
            id="client-search"
            name="q"
            defaultValue={defaultQ}
            placeholder="Search…"
            autoComplete="off"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {clientsQuery.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : clientsQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(clientsQuery.error, "Failed to load clients")}
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      {q
                        ? "No clients match your search."
                        : "No clients yet. Check out a book with borrower details to build this list."}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatLoanDate(c.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="text-muted-foreground flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p>
                {total === 0
                  ? "No clients in this view."
                  : `Showing ${items.length} of ${total} client${total === 1 ? "" : "s"}.`}
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
