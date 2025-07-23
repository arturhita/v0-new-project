"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const InvoiceItemSchema = z.object({
  description: z.string().min(1, "La descrizione è richiesta."),
  type: z.enum(["consultation", "commission", "deduction", "fee", "bonus", "other"]),
  quantity: z.number().min(1, "La quantità deve essere almeno 1."),
  unitPrice: z.number(),
})

const CreateInvoiceSchema = z.object({
  operatorId: z.string().uuid("ID operatore non valido."),
  dueDate: z.string().min(1, "La data di scadenza è richiesta."),
  notes: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1, "La fattura deve avere almeno un elemento."),
})

export async function getOperatorsForInvoiceCreation() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, stage_name")
    .eq("role", "operator")
    .order("stage_name")

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

export async function createInvoice(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    operatorId: formData.get("operatorId"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes"),
    items: JSON.parse(formData.get("items") as string),
  }

  const validation = CreateInvoiceSchema.safeParse(rawData)

  if (!validation.success) {
    return { success: false, message: "Dati non validi.", errors: validation.error.errors }
  }

  const { operatorId, dueDate, notes, items } = validation.data

  try {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: operatorId,
        due_date: dueDate,
        notes: notes,
        total_amount: totalAmount,
        invoice_number: invoiceNumber,
        status: "draft",
      })
      .select("id")
      .single()

    if (invoiceError) throw new Error(`Errore creazione fattura: ${invoiceError.message}`)

    const invoiceId = invoiceData.id

    const itemsToInsert = items.map((item) => ({
      invoice_id: invoiceId,
      description: item.description,
      item_type: item.type,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }))

    const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert)

    if (itemsError) throw new Error(`Errore inserimento elementi fattura: ${itemsError.message}`)

    revalidatePath("/admin/invoices")
    revalidatePath(`/dashboard/operator/invoices`)
    return { success: true, message: `Fattura ${invoiceNumber} creata con successo.` }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getInvoicesForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id, invoice_number, issue_date, due_date, status, total_amount,
      profile:profiles!user_id ( stage_name ),
      invoice_items:invoice_items!invoice_id ( id, description, item_type, quantity, unit_price, total )
    `,
    )
    .order("issue_date", { ascending: false })

  if (error) {
    console.error("Error fetching invoices for admin:", error.message)
    throw new Error(`Impossibile caricare le fatture: ${error.message}`)
  }
  return data
}

export async function getInvoicesForOperator() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("invoices")
    .select(`*, invoice_items:invoice_items!invoice_id(*)`)
    .eq("user_id", user.id)
    .order("issue_date", { ascending: false })

  if (error) {
    console.error("Error fetching invoices for operator:", error)
    return []
  }
  return data
}
