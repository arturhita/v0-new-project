import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({ message: "L'email non è valida." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

export const RegisterSchema = z
  .object({
    email: z.string().email({ message: "L'email non è valida." }),
    password: z.string().min(8, { message: "La password deve contenere almeno 8 caratteri." }),
    confirmPassword: z.string(),
    fullName: z.string().min(3, { message: "Il nome completo è richiesto." }),
    role: z.enum(["client", "operator"], { required_error: "Devi selezionare un tipo di account." }),
    terms: z
      .literal(true, {
        errorMap: () => ({ message: "Devi accettare i Termini di Servizio e l'Informativa sulla Privacy." }),
      })
      .optional(), // Optional because we might not have a checkbox if it's implied
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })
