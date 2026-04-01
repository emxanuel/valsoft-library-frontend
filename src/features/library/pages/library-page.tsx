import { Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import {
  bookCreateSchema,
  type BookCreateFormValues,
} from "@/features/library/schemas"
import {
  useBooksQuery,
  useCreateBookMutation,
} from "@/features/library/hooks/use-library-queries"

function LibrarySearchFilters({
  initialQ,
  initialGenre,
}: {
  initialQ: string
  initialGenre: string
}) {
  const [, setSearchParams] = useSearchParams()
  const [localQ, setLocalQ] = useState(initialQ)
  const [localGenre, setLocalGenre] = useState(initialGenre)

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (localQ.trim()) next.set("q", localQ.trim())
    if (localGenre.trim()) next.set("genre", localGenre.trim())
    setSearchParams(next)
  }

  function clearFilters() {
    setLocalQ("")
    setLocalGenre("")
    setSearchParams({})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search & filters</CardTitle>
        <CardDescription>
          Matches title, author, or ISBN. Genre is an exact match.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={applyFilters}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="q">Search</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                <Input
                  id="q"
                  className="pl-8"
                  placeholder="Title, author, ISBN…"
                  value={localQ}
                  onChange={(e) => setLocalQ(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                placeholder="e.g. fiction"
                value={localGenre}
                onChange={(e) => setLocalGenre(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Apply</Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function LibraryPage() {
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {booksQuery.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
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

function CreateBookDialog() {
  const [open, setOpen] = useState(false)
  const create = useCreateBookMutation()
  const [values, setValues] = useState<BookCreateFormValues>({
    title: "",
    author: "",
    isbn: "",
    description: "",
    published_year: undefined,
    genre: "",
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof BookCreateFormValues, string>>
  >({})

  function resetAndClose() {
    setValues({
      title: "",
      author: "",
      isbn: "",
      description: "",
      published_year: undefined,
      genre: "",
    })
    setFieldErrors({})
    setOpen(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    const parsed = bookCreateSchema.safeParse(values)
    if (!parsed.success) {
      const next: Partial<Record<keyof BookCreateFormValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string") {
          next[key as keyof BookCreateFormValues] = issue.message
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
    create.mutate(payload, { onSuccess: () => resetAndClose() })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add book</DialogTitle>
            <DialogDescription>
              Create a new catalog entry. ISBN must be unique among active
              books.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {create.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(create.error, "Could not create book")}
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={values.title}
                onChange={(e) =>
                  setValues((v) => ({ ...v, title: e.target.value }))
                }
                aria-invalid={!!fieldErrors.title}
              />
              {fieldErrors.title ? (
                <p className="text-destructive text-sm">{fieldErrors.title}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-author">Author</Label>
              <Input
                id="create-author"
                value={values.author}
                onChange={(e) =>
                  setValues((v) => ({ ...v, author: e.target.value }))
                }
                aria-invalid={!!fieldErrors.author}
              />
              {fieldErrors.author ? (
                <p className="text-destructive text-sm">
                  {fieldErrors.author}
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-isbn">ISBN</Label>
                <Input
                  id="create-isbn"
                  value={values.isbn ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, isbn: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-year">Published year</Label>
                <Input
                  id="create-year"
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
              <Label htmlFor="create-genre">Genre</Label>
              <Input
                id="create-genre"
                value={values.genre ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, genre: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Description</Label>
              <Textarea
                id="create-desc"
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
