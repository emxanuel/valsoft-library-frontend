import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { type FormEvent, useEffect, useMemo, useState } from "react"
import { type Resolver, Controller, useForm } from "react-hook-form"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/shared/components/ui/table"
import { Textarea } from "@/features/shared/components/ui/textarea"
import { APP_NAME } from "@/features/shared/constants/branding"
import { useDocumentTitle } from "@/features/shared/hooks/use-document-title"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import { BookAiSuggestButton } from "@/features/books/components/book-ai-suggest-button"
import { CoverUrlPreview } from "@/features/books/components/cover-url-preview"
import { useBookCopiesQuery, useBookQuery, useCheckoutMutation, useCreateBookCopyMutation, useDeleteBookCopyMutation, useDeleteBookMutation, useUpdateBookMutation } from "@/features/books/hooks/use-books-queries"
import {
  bookUpdateSchema,
  checkoutSchema,
  type BookUpdateFormValues,
  type CheckoutFormValues,
} from "@/features/books/schemas"
import type { BookAiEnrichSuggestions, BookCopyRead } from "@/features/books/services/types"

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
  const copiesQuery = useBookCopiesQuery(validId ? id : 0, validId)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [addCopyOpen, setAddCopyOpen] = useState(false)

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
      image_url: b.image_url ?? "",
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
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start">
          <CoverUrlPreview
            url={book.image_url}
            title={book.title}
            className="h-40 w-28 shrink-0 sm:h-48 sm:w-32"
          />
          <div className="min-w-0 space-y-2">
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
          {book.available_copies > 0 ? (
            <Button onClick={() => setCheckoutOpen(true)}>Check out</Button>
          ) : (
            <Button variant="secondary" disabled>
              No copies available
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
          <CardDescription>
            Catalog metadata. Returns are processed from{" "}
            <Link to="/library/loans" className="text-primary underline">
              Open loans
            </Link>
            .
          </CardDescription>
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
          <div>
            <p className="text-muted-foreground text-sm">Copies</p>
            <p className="tabular-nums">
              {book.available_copies} available of {book.total_copies}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Status</p>
            <p>
              {book.total_copies === 0 ? (
                <span className="text-muted-foreground">No copies</span>
              ) : book.is_checked_out ? (
                <span className="text-status-on-loan">All copies out</span>
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

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Copies</CardTitle>
            <CardDescription>
              Physical items in circulation. Barcodes are optional and must be
              unique when set.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setAddCopyOpen(true)}
          >
            <Plus className="size-4" />
            Add copy
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {copiesQuery.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : copiesQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {getApiErrorMessage(copiesQuery.error, "Failed to load copies")}
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(copiesQuery.data?.items ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground"
                    >
                      No copies yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (copiesQuery.data?.items ?? []).map((row) => (
                    <CopyRow
                      key={row.id}
                      bookId={book.id}
                      copy={row}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          )}
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

      <AddCopyDialog
        bookId={book.id}
        open={addCopyOpen}
        onOpenChange={setAddCopyOpen}
      />
    </div>
  )
}

function CopyRow({
  bookId,
  copy,
}: {
  bookId: number
  copy: BookCopyRead
}) {
  const del = useDeleteBookCopyMutation(bookId)
  return (
    <TableRow>
      <TableCell className="tabular-nums">{copy.id}</TableCell>
      <TableCell>{copy.barcode ?? "—"}</TableCell>
      <TableCell>
        {copy.is_checked_out ? (
          <span className="text-status-on-loan">Checked out</span>
        ) : (
          <span className="text-muted-foreground">Available</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={copy.is_checked_out || del.isPending}
          onClick={() => del.mutate(copy.id)}
        >
          {del.isPending ? "…" : "Remove"}
        </Button>
      </TableCell>
    </TableRow>
  )
}

function AddCopyDialog({
  bookId,
  open,
  onOpenChange,
}: {
  bookId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createCopy = useCreateBookCopyMutation(bookId)
  const [barcode, setBarcode] = useState("")

  function submit(e: FormEvent) {
    e.preventDefault()
    const b = barcode.trim()
    createCopy.mutate(
      { barcode: b || undefined },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setBarcode("")
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>Add copy</DialogTitle>
            <DialogDescription>
              Creates another lendable copy for this title.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {createCopy.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(createCopy.error, "Could not add copy")}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="copy-barcode">Barcode (optional)</Label>
              <Input
                id="copy-barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Shelf label or barcode"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCopy.isPending}>
              {createCopy.isPending ? "Adding…" : "Add copy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookUpdateFormValues>({
    resolver: zodResolver(bookUpdateSchema) as Resolver<BookUpdateFormValues>,
    defaultValues: initial,
  })

  useEffect(() => {
    if (open) {
      reset(initial)
    }
  }, [open, initial, reset])

  function applyAiSuggestions(s: BookAiEnrichSuggestions) {
    if (s.title?.trim()) setValue("title", s.title.trim())
    if (s.author?.trim()) setValue("author", s.author.trim())
    if (s.isbn !== undefined && s.isbn !== null)
      setValue("isbn", typeof s.isbn === "string" ? s.isbn : String(s.isbn))
    if (s.description !== undefined && s.description !== null)
      setValue("description", s.description)
    if (s.genre !== undefined && s.genre !== null)
      setValue("genre", s.genre)
    if (s.published_year !== undefined && s.published_year !== null)
      setValue("published_year", s.published_year)
    if (s.image_url !== undefined && s.image_url !== null)
      setValue("image_url", s.image_url)
  }

  function onValid(data: BookUpdateFormValues) {
    const payload = {
      title: data.title,
      author: data.author,
      isbn: data.isbn?.trim() || undefined,
      description: data.description?.trim() || undefined,
      published_year: data.published_year ?? undefined,
      genre: data.genre?.trim() || undefined,
      image_url: data.image_url?.trim() || undefined,
    }
    update.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  const previewUrl = watch("image_url")?.trim() || null
  const previewTitle =
    String(watch("title") ?? initial.title).trim() || "Book"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit(onValid)} noValidate>
          <DialogHeader>
            <DialogTitle>Edit book</DialogTitle>
            <DialogDescription>Update catalog fields.</DialogDescription>
          </DialogHeader>
          <BookAiSuggestButton
            title={String(watch("title") ?? initial.title)}
            author={String(watch("author") ?? initial.author)}
            isbn={String(watch("isbn") ?? "")}
            buildRequest={() => {
              const v = getValues()
              return {
                title: (v.title ?? initial.title).trim(),
                author: (v.author ?? initial.author).trim(),
                isbn: v.isbn?.trim() || undefined,
                description: v.description?.trim() || undefined,
                published_year: v.published_year ?? undefined,
                genre: v.genre?.trim() || undefined,
                image_url: v.image_url?.trim() || undefined,
                exclude_book_id: bookId,
              }
            }}
            onApply={applyAiSuggestions}
          />
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
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title ? (
                <p className="text-destructive text-sm">{errors.title.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                aria-invalid={!!errors.author}
                {...register("author")}
              />
              {errors.author ? (
                <p className="text-destructive text-sm">{errors.author.message}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-isbn">ISBN</Label>
                <Input id="edit-isbn" {...register("isbn")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Published year</Label>
                <Controller
                  name="published_year"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="edit-year"
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value
                        field.onChange(v === "" ? undefined : Number(v))
                      }}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-genre">Genre</Label>
              <Input id="edit-genre" {...register("genre")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image-url">Cover image URL</Label>
              <Input
                id="edit-image-url"
                type="url"
                placeholder="https://…"
                aria-invalid={!!errors.image_url}
                {...register("image_url")}
              />
              {errors.image_url ? (
                <p className="text-destructive text-sm">
                  {errors.image_url.message}
                </p>
              ) : null}
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-start sm:gap-4">
                <p className="text-muted-foreground shrink-0 text-sm">Preview</p>
                <CoverUrlPreview
                  key={previewUrl ?? ""}
                  url={previewUrl}
                  title={previewTitle}
                  className="size-28 sm:size-32"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea id="edit-desc" rows={3} {...register("description")} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      client_name: "",
      client_email: "",
      client_phone: "",
      due_at: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        client_name: "",
        client_email: "",
        client_phone: "",
        due_at: toDateTimeLocalValue(new Date()),
      })
    }
  }, [open, reset])

  function onValid(data: CheckoutFormValues) {
    const due = toDueAtIso(data.due_at ?? "")
    const phone = data.client_phone?.trim()
    checkout.mutate(
      {
        client: {
          name: data.client_name.trim(),
          email: data.client_email.trim(),
          phone: phone ? phone : undefined,
        },
        due_at: due,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onValid)} noValidate>
          <DialogHeader>
            <DialogTitle>Check out</DialogTitle>
            <DialogDescription>
              Record the borrower and an optional due date (local time).
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
              <Label htmlFor="client_name">Borrower name</Label>
              <Input
                id="client_name"
                autoComplete="name"
                aria-invalid={!!errors.client_name}
                {...register("client_name")}
              />
              {errors.client_name ? (
                <p className="text-destructive text-sm">
                  {errors.client_name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.client_email}
                {...register("client_email")}
              />
              {errors.client_email ? (
                <p className="text-destructive text-sm">
                  {errors.client_email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_phone">Phone (optional)</Label>
              <Input
                id="client_phone"
                type="tel"
                autoComplete="tel"
                aria-invalid={!!errors.client_phone}
                {...register("client_phone")}
              />
              {errors.client_phone ? (
                <p className="text-destructive text-sm">
                  {errors.client_phone.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_at">Due date</Label>
              <Input
                id="due_at"
                type="datetime-local"
                aria-invalid={!!errors.due_at}
                {...register("due_at")}
              />
              {errors.due_at ? (
                <p className="text-destructive text-sm">
                  {errors.due_at.message}
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
