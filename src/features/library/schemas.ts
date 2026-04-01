import { z } from "zod"

export const bookCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  published_year: z.coerce.number().int().optional().nullable(),
  genre: z.string().optional(),
})

export type BookCreateFormValues = z.infer<typeof bookCreateSchema>

export const bookUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  author: z.string().min(1, "Author is required").optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  published_year: z.coerce.number().int().optional().nullable(),
  genre: z.string().optional(),
})

export type BookUpdateFormValues = z.infer<typeof bookUpdateSchema>

export const checkoutSchema = z.object({
  due_at: z.string().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
