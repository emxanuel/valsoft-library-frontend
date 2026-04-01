import { Plus } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription } from "@/features/shared/components/ui/alert"
import { Button } from "@/features/shared/components/ui/button"
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
import { Textarea } from "@/features/shared/components/ui/textarea"
import { getApiErrorMessage } from "@/features/shared/lib/api-error"
import {
  bookCreateSchema,
  type BookCreateFormValues,
} from "@/features/library/schemas"
import { useCreateBookMutation } from "@/features/library/hooks/use-library-queries"

export function CreateBookDialog() {
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
