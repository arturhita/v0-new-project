import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({
    message: "Inserisci un'email valida.",
  }),
  password: z.string().min(1, {
    message: "La password è richiesta.",
  }),
})

export const registerSchema = z.object({
  email: z.string().email({
    message: "Inserisci un'email valida.",
  }),
  password: z.string().min(6, {
    message: "La password deve contenere almeno 6 caratteri.",
  }),
  fullName: z.string().min(1, {
    message: "Il nome completo è richiesto.",
  }),
})
