import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Per favore, inserisci un indirizzo email valido.",
  }),
  password: z.string().min(1, {
    message: "La password è richiesta.",
  }),
})

export const RegisterSchema = z.object({
  name: z.string().min(1, {
    message: "Il nome è richiesto.",
  }),
  email: z.string().email({
    message: "Per favore, inserisci un indirizzo email valido.",
  }),
  password: z.string().min(6, {
    message: "La password deve contenere almeno 6 caratteri.",
  }),
})
