import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Inserisci un'email valida.",
  }),
  password: z.string().min(1, {
    message: "La password è richiesta.",
  }),
})

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Inserisci un'email valida.",
  }),
  password: z.string().min(6, {
    message: "La password deve contenere almeno 6 caratteri.",
  }),
  fullName: z.string().min(1, {
    message: "Il nome è richiesto.",
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: "Devi accettare i Termini di Servizio e l'Informativa sulla Privacy.",
  }),
})

export const OperatorApplicationSchema = z.object({
  fullName: z.string().min(1, "Il nome completo è richiesto."),
  email: z.string().email("Email non valida."),
  phone: z.string().min(1, "Il numero di telefono è richiesto."),
  specialization: z.string().min(1, "La specializzazione è richiesta."),
  experience: z.string().min(1, "Descrivi la tua esperienza."),
  motivation: z.string().min(1, "La motivazione è richiesta."),
  cv: z
    .any()
    .refine((file) => file?.size <= 5000000, `La dimensione massima del file è 5MB.`)
    .refine((file) => file?.type === "application/pdf", "Sono accettati solo file PDF."),
})

export const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, "La recensione deve contenere almeno 10 caratteri.")
    .max(1000, "La recensione non può superare i 1000 caratteri."),
  consultation_id: z.string().uuid(),
  operator_id: z.string().uuid(),
})

export const OperatorProfileSchema = z.object({
  bio: z.string().max(1500, "La biografia non può superare i 1500 caratteri.").optional(),
  services_description: z
    .string()
    .max(1000, "La descrizione dei servizi non può superare i 1000 caratteri.")
    .optional(),
  specialties: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
})
