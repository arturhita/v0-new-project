import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

export const registerSchema = z
  .object({
    fullName: z.string().min(3, { message: "Il nome completo è richiesto." }),
    email: z.string().email({ message: "Inserisci un'email valida." }),
    password: z.string().min(8, { message: "La password deve contenere almeno 8 caratteri." }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "Devi accettare i Termini di Servizio.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida." }),
})

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, { message: "La password deve contenere almeno 8 caratteri." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })

export const TicketStatus = z.enum(["Open", "InProgress", "Closed", "Resolved"])
export type TicketStatus = z.infer<typeof TicketStatus>

export const PayoutStatus = z.enum(["pending", "processing", "completed", "failed"])
export type PayoutStatus = z.infer<typeof PayoutStatus>
