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
import {
  bookCreateSchema,
  type BookCreateFormValues,
} from "@/features/library/schemas"
import { useCreateBookMutation } from "@/features/library/hooks/use-library-queries"

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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-isbn">ISBN</Label>
                <Input id="create-isbn" {...register("isbn")} />
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
