import { Pencil, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { Navigate, useSearchParams } from "react-router"

import { CreateStaffDialog } from "@/features/admin/components/create-staff-dialog"
import { DeleteStaffDialog } from "@/features/admin/components/delete-staff-dialog"
import { EditStaffDialog } from "@/features/admin/components/edit-staff-dialog"
import { useStaffListQuery } from "@/features/admin/hooks/use-admin-queries"
import type { StaffRead } from "@/features/admin/services/types"
import { useAuthStore } from "@/features/auth/stores/auth-store"
import { PageHeader } from "@/features/shared/components/page-header"
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

const DEFAULT_PAGE_SIZE = 20

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10)
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

export function StaffListPage() {
  const user = useAuthStore((s) => s.user)
  const [editStaff, setEditStaff] = useState<StaffRead | null>(null)
  const [deleteStaff, setDeleteStaff] = useState<StaffRead | null>(null)
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

  const listQuery = useStaffListQuery(listParams)

  const total = listQuery.data?.total ?? 0
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit)
  const items = listQuery.data?.items ?? []

  useEffect(() => {
    if (!listQuery.isSuccess) return
    const t = listQuery.data?.total ?? 0
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
  }, [listQuery.isSuccess, listQuery.data?.total, limit, page, setSearchParams])

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

  if (!user || user.role !== "admin") {
    return <Navigate to="/library" replace />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Staff"
          description="Manage staff accounts. Admins can promote employees or remove accounts without loan history."
          className="sm:flex-1"
        />
        <CreateStaffDialog />
      </div>

      <form
        key={searchFormKey}
        onSubmit={applySearch}
        className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-2">
          <Label htmlFor="staff-q">Search</Label>
          <Input
            id="staff-q"
            name="q"
            placeholder="Name or email"
            defaultValue={defaultQ}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {listQuery.isPending ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : listQuery.isError ? (
            <p className="text-destructive p-6 text-sm">
              Could not load staff list.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">
                        No staff match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.first_name} {row.last_name}
                        </TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell className="capitalize">{row.role}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(row.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit ${row.email}`}
                              onClick={() => setEditStaff(row)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${row.email}`}
                              onClick={() => setDeleteStaff(row)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {total > limit ? (
                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-sm">
                  <span>
                    Page {page} of {totalPages} ({total} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      Previous
                    </Button>
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
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <EditStaffDialog
        staff={editStaff}
        open={editStaff !== null}
        onOpenChange={(o) => {
          if (!o) setEditStaff(null)
        }}
      />
      <DeleteStaffDialog
        staff={deleteStaff}
        open={deleteStaff !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteStaff(null)
        }}
      />
    </div>
  )
}
