import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { type Resolver, Controller, useForm } from "react-hook-form"

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
import { BookAiSuggestButton } from "@/features/books/components/book-ai-suggest-button"
import { CoverUrlPreview } from "@/features/books/components/cover-url-preview"
import { useCreateBookMutation } from "@/features/books/hooks/use-books-queries"
import {
  bookCreateSchema,
  type BookCreateFormValues,
} from "@/features/books/schemas"
import type { BookAiEnrichSuggestions } from "@/features/books/services/types"

const emptyValues: BookCreateFormValues = {
  title: "",
  author: "",
  isbn: "",
  description: "",
  published_year: undefined,
  genre: "",
  image_url: "",
}

export function CreateBookDialog() {
  const [open, setOpen] = useState(false)
  const create = useCreateBookMutation()
  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookCreateFormValues>({
    resolver: zodResolver(bookCreateSchema) as Resolver<BookCreateFormValues>,
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(emptyValues)
    }
  }, [open, reset])

  function resetAndClose() {
    reset(emptyValues)
    setOpen(false)
  }

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

  function onValid(data: BookCreateFormValues) {
    const payload = {
      title: data.title,
      author: data.author,
      isbn: data.isbn?.trim() || undefined,
      description: data.description?.trim() || undefined,
      published_year: data.published_year ?? undefined,
      genre: data.genre?.trim() || undefined,
      image_url: data.image_url?.trim() || undefined,
    }
    create.mutate(payload, { onSuccess: () => resetAndClose() })
  }

  const previewUrl = watch("image_url")?.trim() || null
  const previewTitle = String(watch("title") ?? "").trim() || "Book"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit(onValid)} noValidate>
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
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title ? (
                <p className="text-destructive text-sm">{errors.title.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-author">Author</Label>
              <Input
                id="create-author"
                aria-invalid={!!errors.author}
                {...register("author")}
              />
              {errors.author ? (
                <p className="text-destructive text-sm">
                  {errors.author.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-isbn">ISBN</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                <Input
                  id="create-isbn"
                  className="min-w-0 flex-1"
                  {...register("isbn")}
                />
                <BookAiSuggestButton
                  compact
                  title={String(watch("title") ?? "")}
                  author={String(watch("author") ?? "")}
                  isbn={String(watch("isbn") ?? "")}
                  buildRequest={() => {
                    const v = getValues()
                    return {
                      title: v.title.trim(),
                      author: v.author.trim(),
                      isbn: v.isbn?.trim() || undefined,
                      description: v.description?.trim() || undefined,
                      published_year: v.published_year ?? undefined,
                      genre: v.genre?.trim() || undefined,
                      image_url: v.image_url?.trim() || undefined,
                    }
                  }}
                  onApply={applyAiSuggestions}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-year">Published year</Label>
              <Controller
                name="published_year"
                control={control}
                render={({ field }) => (
                  <Input
                    id="create-year"
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
            <div className="space-y-2">
              <Label htmlFor="create-genre">Genre</Label>
              <Input id="create-genre" {...register("genre")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-image-url">Cover image URL</Label>
              <Input
                id="create-image-url"
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
              <Label htmlFor="create-desc">Description</Label>
              <Textarea id="create-desc" rows={3} {...register("description")} />
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
