import { z } from "zod"

export const TicketStatus = z.enum(["OPEN", "IN_PROGRESS", "CLOSED"])

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(1, { message: "La password è richiesta" }),
})

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(6, { message: "La password deve contenere almeno 6 caratteri" }),
  fullName: z.string().min(1, { message: "Il nome completo è richiesto" }),
})
