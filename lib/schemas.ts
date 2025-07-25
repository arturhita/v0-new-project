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

export type PayoutStatus = "pending" | "approved" | "rejected" | "processed"

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed"

export const PayoutRequestSchema = z.object({
  amount: z.number().min(10, "L'importo minimo è €10"),
  paymentMethod: z.enum(["bank_transfer", "paypal", "stripe"]),
  bankDetails: z
    .object({
      iban: z.string().optional(),
      bankName: z.string().optional(),
      accountHolder: z.string().optional(),
    })
    .optional(),
})

export const TicketSchema = z.object({
  subject: z.string().min(1, "L'oggetto è richiesto"),
  message: z.string().min(10, "Il messaggio deve contenere almeno 10 caratteri"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.enum(["technical", "billing", "account", "general"]).default("general"),
})

export const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Il commento deve contenere almeno 10 caratteri"),
  service_type: z.enum(["chat", "call", "email"]),
})

export const NotificationSchema = z.object({
  title: z.string().min(1, "Il titolo è richiesto"),
  message: z.string().min(1, "Il messaggio è richiesto"),
  targetAudience: z.enum(["all", "clients", "operators"]),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
})
