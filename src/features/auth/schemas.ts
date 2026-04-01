import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ message: "Enter a valid email address" }),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email({ message: "Enter a valid email address" }),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
