import { z } from "zod"

export const clientCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  phone: z.string().optional(),
})

export type ClientCreateFormValues = z.infer<typeof clientCreateSchema>

export const clientEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  phone: z.string().optional(),
})

export type ClientEditFormValues = z.infer<typeof clientEditSchema>
