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
  email: z.string().email({
    message: "Per favore, inserisci un indirizzo email valido.",
  }),
  password: z.string().min(6, {
    message: "La password deve contenere almeno 6 caratteri.",
  }),
  name: z.string().min(1, {
    message: "Il nome è richiesto.",
  }),
})

export const ApplicationSchema = z.object({
  phone: z.string().min(1, "Il numero di telefono è richiesto."),
  experience: z.string().min(1, "Il campo esperienza è richiesto."),
  specialties: z.array(z.string()).min(1, "Seleziona almeno una specializzazione."),
  description: z.string().min(1, "La descrizione è richiesta."),
  availability: z.string().min(1, "La disponibilità è richiesta."),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "Devi accettare i termini e le condizioni.",
  }),
})
