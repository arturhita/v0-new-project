import { z } from "zod"

export const OperatorRegistrationSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve avere almeno 2 caratteri." }),
  surname: z.string().min(2, { message: "Il cognome deve avere almeno 2 caratteri." }),
  stageName: z.string().min(3, { message: "Il nome d'arte deve avere almeno 3 caratteri." }),
  email: z.string().email({ message: "Inserisci un'email valida." }),
  password: z.string().min(8, { message: "La password deve avere almeno 8 caratteri." }),
  bio: z.string().optional(),
  categories: z.array(z.string()).optional(),
})

export const OperatorProfileSchema = z.object({
  full_name: z.string().min(3, "Il nome completo è richiesto."),
  stage_name: z.string().min(3, "Il nome d'arte è richiesto."),
  email: z.string().email("Email non valida."),
  bio: z.string().optional(),
  specialties: z.string().optional(),
  categories: z.string().optional(),
  // Rimuoviamo i campi non esistenti
  // experience: z.string().optional(),
  // specializations_details: z.string().optional(),
  chat_price: z.coerce.number().optional(),
  call_price: z.coerce.number().optional(),
  written_price: z.coerce.number().optional(),
})
