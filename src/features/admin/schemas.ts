import { z } from "zod"

export const staffCreateSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export type StaffCreateFormValues = z.infer<typeof staffCreateSchema>

export const staffUpdateSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional().or(z.literal("")),
  role: z.enum(["admin", "employee"]).optional(),
})

export type StaffUpdateFormValues = z.infer<typeof staffUpdateSchema>
