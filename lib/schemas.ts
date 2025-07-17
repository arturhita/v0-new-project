import { z } from "zod"

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

export const OperatorProfileSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida." }),
  full_name: z.string().min(3, { message: "Il nome completo deve contenere almeno 3 caratteri." }),
  stage_name: z.string().min(3, { message: "Il nome d'arte deve contenere almeno 3 caratteri." }),
  bio: z.string().optional(),
  specialization: z.string().optional(), // Comma-separated
  tags: z.string().optional(), // Comma-separated
  // Converte stringhe vuote in undefined per una validazione opzionale corretta
  chat_price: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive().optional()),
  call_price: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive().optional()),
  written_price: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive().optional()),
  experience: z.string().optional(),
  specializations_details: z.string().optional(),
})
