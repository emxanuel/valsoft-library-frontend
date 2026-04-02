import axios from "axios"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"

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
import { APP_NAME } from "@/features/shared/constants/branding"
import { useDocumentTitle } from "@/features/shared/hooks/use-document-title"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import { DeleteClientDialog } from "@/features/clients/components/delete-client-dialog"
import { EditClientDialog } from "@/features/clients/components/edit-client-dialog"
import { useClientQuery } from "@/features/clients/hooks/use-clients-queries"
import type { ClientRead } from "@/features/clients/services/types"
import { useLoanHistoryQuery } from "@/features/loans/hooks/use-loans-queries"
import { formatLoanDate } from "@/features/loans/lib/format-loan-date"

const DEFAULT_PAGE_SIZE = 20

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10)
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

export function ClientDetailPage() {
  const { clientId: clientIdParam } = useParams<{ clientId: string }>()
  const id = Number(clientIdParam)
  const validId = Number.isFinite(id) && id >= 1
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const page = parsePositiveInt(searchParams.get("page"), 1)
  const limit = Math.min(
    100,
    Math.max(1, parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE)),
  )
  const offset = (page - 1) * limit

  const clientQuery = useClientQuery(validId ? id : 0, validId)

  const historyParams = useMemo(
    () => ({ client_id: id, offset, limit }),
    [id, offset, limit],
  )

  const historyQuery = useLoanHistoryQuery(
    historyParams,
    validId && clientQuery.isSuccess,
  )

  const client = clientQuery.data
  const documentTitle = useMemo(() => {
    if (!validId) return APP_NAME
    if (clientQuery.isPending) return `Client | ${APP_NAME}`
    if (clientQuery.isError) return `Client | ${APP_NAME}`
    if (client) return `${client.name} | ${APP_NAME}`
    return APP_NAME
  }, [validId, clientQuery.isPending, clientQuery.isError, client])

  useDocumentTitle(documentTitle)

  const total = historyQuery.data?.total ?? 0
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit)
  const loanItems = historyQuery.data?.items ?? []

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
  }, [
    historyQuery.isSuccess,
    historyQuery.data?.total,
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

  if (!validId) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">Invalid client id.</p>
        <Button variant="outline" asChild>
          <Link to="/library/clients">Back to clients</Link>
        </Button>
      </div>
    )
  }

  if (clientQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (clientQuery.isError) {
    const is404 =
      axios.isAxiosError(clientQuery.error) &&
      clientQuery.error.response?.status === 404
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {is404
              ? "Client not found."
              : getApiErrorMessage(clientQuery.error, "Failed to load client")}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link to="/library/clients">Back to clients</Link>
        </Button>
      </div>
    )
  }

  const c = client as ClientRead

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={c.name}
          description="Patron profile and loan activity for this client."
          className="sm:flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/library/clients">All clients</Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
          <CardDescription>Directory record for this patron.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-1 text-sm">
          <p>
            <span className="text-foreground font-medium">Email:</span> {c.email}
          </p>
          <p>
            <span className="text-foreground font-medium">Phone:</span>{" "}
            {c.phone ?? "—"}
          </p>
          <p>
            <span className="text-foreground font-medium">Added:</span>{" "}
            {formatLoanDate(c.created_at)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Loans</CardTitle>
          <CardDescription>
            Open and returned loans linked to this patron (all staff).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {historyQuery.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : historyQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {getApiErrorMessage(historyQuery.error, "Failed to load loans")}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Copy</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Checked out</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Returned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground">
                        No loans for this patron yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loanItems.map((row) => (
                      <TableRow key={row.loan_id}>
                        <TableCell>
                          {row.returned_at ? (
                            <span className="text-muted-foreground">Returned</span>
                          ) : (
                            <span className="text-status-on-loan">On loan</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-44 min-w-0">
                          <Link
                            to={`/library/books/${row.book_id}`}
                            className="text-primary block truncate font-medium hover:underline"
                          >
                            {row.book_title}
                          </Link>
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {row.copy_barcode ?? `#${row.copy_id}`}
                        </TableCell>
                        <TableCell className="max-w-40 truncate text-sm">
                          {row.staff_email ?? "—"}
                        </TableCell>
                        <TableCell>
                          {formatLoanDate(row.checked_out_at)}
                        </TableCell>
                        <TableCell>
                          {row.due_at ? formatLoanDate(row.due_at) : "—"}
                        </TableCell>
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
                    ? "No loans in this view."
                    : `Showing ${loanItems.length} of ${total} loan${total === 1 ? "" : "s"}.`}
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
          )}
        </CardContent>
      </Card>

      <EditClientDialog
        client={c}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteClientDialog
        client={deleteOpen ? c : null}
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteOpen(false)
        }}
        onDeleted={() => {
          setDeleteOpen(false)
          void navigate("/library/clients", { replace: true })
        }}
      />
    </div>
  )
}
