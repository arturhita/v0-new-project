import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email non valida." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

export const RegisterSchema = z.object({
  name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri."),
  email: z.string().email("Email non valida."),
  password: z.string().min(8, "La password deve contenere almeno 8 caratteri."),
})

export const OperatorRegistrationSchema = z
  .object({
    name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri."),
    surname: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri."),
    stageName: z.string().min(3, "Il nome d'arte deve contenere almeno 3 caratteri."),
    email: z.string().email("Email non valida."),
    password: z.string().min(8, "La password deve contenere almeno 8 caratteri."),
    confirmPassword: z.string(),
    bio: z.string().max(1000, "La biografia non può superare i 1000 caratteri.").optional().default(""),
    categories: z.array(z.string()).min(1, "Seleziona almeno una categoria."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"], // Assegna l'errore al campo di conferma
  })
