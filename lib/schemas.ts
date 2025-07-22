import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Per favore, inserisci un'email valida.",
  }),
  password: z.string().min(1, {
    message: "La password è richiesta.",
  }),
})

export const RegisterSchema = z
  .object({
    fullName: z.string().min(3, { message: "Il nome completo è richiesto." }),
    email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
    password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      error_map: () => ({ message: "Devi accettare i Termini e le Condizioni." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"], // Indica quale campo segnalare per l'errore
  })
