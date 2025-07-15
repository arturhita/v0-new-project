import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "L'email non è valida.",
  }),
  password: z.string().min(1, {
    message: "La password è richiesta.",
  }),
})

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "L'email non è valida.",
  }),
  password: z.string().min(6, {
    message: "La password deve contenere almeno 6 caratteri.",
  }),
  name: z.string().min(1, {
    message: "Il nome è richiesto.",
  }),
})
