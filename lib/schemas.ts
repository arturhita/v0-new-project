import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Per favore inserisci un indirizzo email valido.",
  }),
  password: z.string().min(1, {
    message: "La password è obbligatoria.",
  }),
})

export const RegisterSchema = z
  .object({
    fullName: z.string().min(3, { message: "Il nome completo deve contenere almeno 3 caratteri." }),
    email: z.string().email({ message: "Email non valida." }),
    password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Devi accettare i Termini e Condizioni." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed"
export type PayoutStatus = "Pending" | "Processing" | "Completed" | "Rejected"
