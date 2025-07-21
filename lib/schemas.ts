import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

export const RegisterSchema = z
  .object({
    firstName: z.string().min(1, { message: "Il nome è richiesto." }),
    lastName: z.string().min(1, { message: "Il cognome è richiesto." }),
    email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
    password: z.string().min(6, { message: "La password deve essere di almeno 6 caratteri." }),
    confirmPassword: z.string(),
    role: z.enum(["client", "operator"]),
    terms: z.literal(true, {
      error_map: () => ({ message: "Devi accettare i Termini e le Condizioni." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"], // path of error
  })
