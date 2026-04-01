import axios from "axios"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"

import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import { Button } from "@/features/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/components/ui/dialog"
import { Input } from "@/features/shared/components/ui/input"
import { Label } from "@/features/shared/components/ui/label"
import { Skeleton } from "@/features/shared/components/ui/skeleton"
import { Textarea } from "@/features/shared/components/ui/textarea"
import { APP_NAME } from "@/features/shared/constants/branding"
import { useDocumentTitle } from "@/features/shared/hooks/use-document-title"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import {
  bookUpdateSchema,
  checkoutSchema,
  type BookUpdateFormValues,
  type CheckoutFormValues,
} from "@/features/library/schemas"
import {
  useBookQuery,
  useCheckinMutation,
  useCheckoutMutation,
  useDeleteBookMutation,
  useUpdateBookMutation,
} from "@/features/library/hooks/use-library-queries"

function toDueAtIso(local: string): string | undefined {
  if (!local.trim()) return undefined
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

function toDateTimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const id = Number(bookId)
  const navigate = useNavigate()

  const validId = Number.isFinite(id) && id >= 1
  const bookQuery = useBookQuery(validId ? id : 0, validId)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const editInitial = useMemo(() => {
    const b = bookQuery.data
    if (!b) return undefined
    return {
      title: b.title,
      author: b.author,
      isbn: b.isbn ?? "",
      description: b.description ?? "",
      published_year: b.published_year ?? undefined,
      genre: b.genre ?? "",
    }
  }, [bookQuery.data])

  const documentTitle = useMemo(() => {
    if (!bookId || !Number.isFinite(id) || id < 1) return APP_NAME
    if (bookQuery.isPending) return `Book | ${APP_NAME}`
    if (bookQuery.isError) return `Book | ${APP_NAME}`
    if (bookQuery.data) return `${bookQuery.data.title} | ${APP_NAME}`
    return APP_NAME
  }, [bookId, id, bookQuery.isPending, bookQuery.isError, bookQuery.data])

  useDocumentTitle(documentTitle)

  if (!bookId || !Number.isFinite(id) || id < 1) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">Invalid book id.</p>
        <Button variant="outline" asChild>
          <Link to="/library/books">Back to books</Link>
        </Button>
      </div>
    )
  }

  if (bookQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (bookQuery.isError) {
    const is404 =
      axios.isAxiosError(bookQuery.error) &&
      bookQuery.error.response?.status === 404
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {is404
              ? "Book not found."
              : getApiErrorMessage(bookQuery.error, "Failed to load book")}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link to="/library/books">Back to books</Link>
        </Button>
      </div>
    )
  }

  const book = bookQuery.data

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-fit gap-2 px-0" asChild>
            <Link to="/library/books">
              <ArrowLeft className="size-4" />
              Books
            </Link>
          </Button>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {book.title}
          </h1>
          <p className="text-muted-foreground">
            {book.author}
            {book.genre ? ` · ${book.genre}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          {book.is_checked_out ? (
            <CheckinButton bookId={book.id} />
          ) : (
            <Button onClick={() => setCheckoutOpen(true)}>Check out</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
          <CardDescription>Catalog metadata and availability.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">ISBN</p>
            <p>{book.isbn ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Published</p>
            <p>{book.published_year ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-sm">Status</p>
            <p>
              {book.is_checked_out ? (
                <span className="text-status-on-loan">Checked out</span>
              ) : (
                <span className="text-muted-foreground">Available</span>
              )}
            </p>
          </div>
          {book.description ? (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-sm">Description</p>
              <p className="whitespace-pre-wrap">{book.description}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {editInitial ? (
        <EditBookDialog
          bookId={book.id}
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={editInitial}
        />
      ) : null}

      <DeleteBookDialog
        bookId={book.id}
        title={book.title}
        isCheckedOut={book.is_checked_out}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate("/library", { replace: true })}
      />

      <CheckoutDialog
        bookId={book.id}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
      />
    </div>
  )
}

function CheckinButton({ bookId }: { bookId: number }) {
  const checkin = useCheckinMutation(bookId)
  return (
    <Button
      variant="secondary"
      disabled={checkin.isPending}
      onClick={() => checkin.mutate()}
    >
      {checkin.isPending ? "Returning…" : "Check in"}
    </Button>
  )
}

function EditBookDialog({
  bookId,
  open,
  onOpenChange,
  initial,
}: {
  bookId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: BookUpdateFormValues & { title: string; author: string }
}) {
  const update = useUpdateBookMutation(bookId)
  const [values, setValues] = useState(initial)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof BookUpdateFormValues, string>>
  >({})

  function handleOpenChange(next: boolean) {
    if (next) {
      setValues(initial)
      setFieldErrors({})
    }
    onOpenChange(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    const parsed = bookUpdateSchema.safeParse(values)
    if (!parsed.success) {
      const next: Partial<Record<keyof BookUpdateFormValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string") {
          next[key as keyof BookUpdateFormValues] = issue.message
        }
      }
      setFieldErrors(next)
      return
    }
    const payload = {
      title: parsed.data.title,
      author: parsed.data.author,
      isbn: parsed.data.isbn?.trim() || undefined,
      description: parsed.data.description?.trim() || undefined,
      published_year: parsed.data.published_year ?? undefined,
      genre: parsed.data.genre?.trim() || undefined,
    }
    update.mutate(payload, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit book</DialogTitle>
            <DialogDescription>Update catalog fields.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {update.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(update.error, "Could not update book")}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={values.title ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, title: e.target.value }))
                }
              />
              {fieldErrors.title ? (
                <p className="text-destructive text-sm">{fieldErrors.title}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                value={values.author ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, author: e.target.value }))
                }
              />
              {fieldErrors.author ? (
                <p className="text-destructive text-sm">{fieldErrors.author}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-isbn">ISBN</Label>
                <Input
                  id="edit-isbn"
                  value={values.isbn ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, isbn: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Published year</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={values.published_year ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      published_year:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-genre">Genre</Label>
              <Input
                id="edit-genre"
                value={values.genre ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, genre: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={values.description ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteBookDialog({
  bookId,
  title,
  isCheckedOut,
  open,
  onOpenChange,
  onDeleted,
}: {
  bookId: number
  title: string
  isCheckedOut: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  const deleteMutation = useDeleteBookMutation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete book</DialogTitle>
          <DialogDescription>
            {isCheckedOut
              ? "This book is checked out and cannot be deleted. Check it in first."
              : `Remove “${title}” from the catalog? This is a soft delete.`}
          </DialogDescription>
        </DialogHeader>
        {deleteMutation.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {getApiErrorMessage(deleteMutation.error, "Could not delete book")}
            </AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isCheckedOut || deleteMutation.isPending}
            onClick={() =>
              deleteMutation.mutate(bookId, { onSuccess: onDeleted })
            }
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CheckoutDialog({
  bookId,
  open,
  onOpenChange,
}: {
  bookId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const checkout = useCheckoutMutation(bookId)
  const [values, setValues] = useState<CheckoutFormValues>({ due_at: "" })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CheckoutFormValues, string>>
  >({})

  function handleOpenChange(next: boolean) {
    if (next) {
      setValues({ due_at: toDateTimeLocalValue(new Date()) })
      setFieldErrors({})
    }
    onOpenChange(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    const parsed = checkoutSchema.safeParse(values)
    if (!parsed.success) {
      const next: Partial<Record<keyof CheckoutFormValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === "due_at") next.due_at = issue.message
      }
      setFieldErrors(next)
      return
    }
    const due = toDueAtIso(parsed.data.due_at ?? "")
    checkout.mutate(
      { due_at: due },
      { onSuccess: () => handleOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Check out</DialogTitle>
            <DialogDescription>
              Optional due date for this loan (local time).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {checkout.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(checkout.error, "Checkout failed")}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="due_at">Due date</Label>
              <Input
                id="due_at"
                type="datetime-local"
                value={values.due_at ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, due_at: e.target.value }))
                }
              />
              {fieldErrors.due_at ? (
                <p className="text-destructive text-sm">{fieldErrors.due_at}</p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={checkout.isPending}>
              {checkout.isPending ? "Checking out…" : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
