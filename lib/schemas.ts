import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Inserisci un'email valida.",
  }),
  password: z.string().min(1, {
    message: "La password è obbligatoria.",
  }),
})

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Inserisci un'email valida.",
  }),
  password: z.string().min(6, {
    message: "La password deve contenere almeno 6 caratteri.",
  }),
  name: z.string().min(1, {
    message: "Il nome è obbligatorio.",
  }),
})

// These types are for useActionState, which is no longer used
// but can be kept for reference or other potential uses.
export type SignupState = {
  success: boolean
  message: string
}

export type LoginState = {
  success: boolean
  error: string | null
}
