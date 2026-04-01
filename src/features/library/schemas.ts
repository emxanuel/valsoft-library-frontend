import { z } from "zod"

const optionalHttpUrl = z
  .string()
  .optional()
  .refine(
    (val) => !val?.trim() || z.string().url().safeParse(val.trim()).success,
    { message: "Enter a valid URL" },
  )

export const bookCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  published_year: z.coerce.number().int().optional().nullable(),
  genre: z.string().optional(),
  image_url: optionalHttpUrl,
})

export type BookCreateFormValues = z.infer<typeof bookCreateSchema>

export const bookUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  author: z.string().min(1, "Author is required").optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  published_year: z.coerce.number().int().optional().nullable(),
  genre: z.string().optional(),
  image_url: optionalHttpUrl,
})

export type BookUpdateFormValues = z.infer<typeof bookUpdateSchema>

export const checkoutSchema = z.object({
  client_name: z.string().min(1, "Name is required"),
  client_email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  client_phone: z.string().optional(),
  due_at: z.string().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
