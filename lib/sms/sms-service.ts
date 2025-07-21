"use server"

export interface SMSData {
  to: string
  message: string
  template?: string
  variables?: Record<string, any>
}

export interface SMSTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

class SMSService {
  private templates: Map<string, SMSTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates() {
    // Template Conferma Consulenza
    this.templates.set("consultation-reminder", {
      id: "consultation-reminder",
      name: "Promemoria Consulenza",
      content: "🔮 Unveilly: La tua consulenza con {{operatorName}} inizia tra 15 minuti! Collegati su {{url}}",
      variables: ["operatorName", "url"],
    })

    // Template Codice Verifica
    this.templates.set("verification-code", {
      id: "verification-code",
      name: "Codice Verifica",
      content: "🔐 Unveilly: Il tuo codice di verifica è {{code}}. Non condividerlo con nessuno. Valido per 10 minuti.",
      variables: ["code"],
    })

    // Template Consulenza Iniziata
    this.templates.set("consultation-started", {
      id: "consultation-started",
      name: "Consulenza Iniziata",
      content: "✨ La tua consulenza con {{operatorName}} è iniziata! Durata: {{duration}} min. Buona sessione!",
      variables: ["operatorName", "duration"],
    })

    // Template Pagamento Completato
    this.templates.set("payment-success", {
      id: "payment-success",
      name: "Pagamento Completato",
      content:
        "💳 Unveilly: Pagamento di €{{amount}} completato con successo. Grazie per aver scelto i nostri servizi!",
      variables: ["amount"],
    })

    // Template Credito Insufficiente
    this.templates.set("low-credit", {
      id: "low-credit",
      name: "Credito Insufficiente",
      content:
        "⚠️ Unveilly: Il tuo credito è basso (€{{balance}}). Ricarica ora per continuare le consulenze: {{rechargeUrl}}",
      variables: ["balance", "rechargeUrl"],
    })
  }

  async sendSMS(data: SMSData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let message = data.message

      // Se è specificato un template, usalo
      if (data.template) {
        const template = this.templates.get(data.template)
        if (!template) {
          throw new Error(`Template SMS ${data.template} non trovato`)
        }
        message = template.content

        // Sostituisci le variabili
        if (data.variables) {
          Object.entries(data.variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, "g")
            message = message.replace(regex, String(value))
          })
        }
      }

      // Validazione numero di telefono
      if (!this.isValidPhoneNumber(data.to)) {
        throw new Error("Numero di telefono non valido")
      }

      // Simula invio SMS (in produzione usare Twilio, AWS SNS, etc.)
      console.log("📱 Invio SMS:", {
        to: data.to,
        message,
        template: data.template,
        variables: data.variables,
      })

      // Simula ritardo di invio
      await new Promise((resolve) => setTimeout(resolve, 300))

      const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return {
        success: true,
        messageId,
      }
    } catch (error) {
      console.error("Errore invio SMS:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Errore sconosciuto",
      }
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Regex semplificata per numeri italiani e internazionali
    const phoneRegex = /^(\+39|0039|39)?[\s]?([0-9]{2,4}[\s]?[0-9]{6,8})$/
    return phoneRegex.test(phone.replace(/[\s-]/g, ""))
  }

  getTemplate(templateId: string): SMSTemplate | undefined {
    return this.templates.get(templateId)
  }

  getAllTemplates(): SMSTemplate[] {
    return Array.from(this.templates.values())
  }
}

export const smsService = new SMSService()

// Funzioni helper per invii comuni
export async function sendConsultationReminder(phoneNumber: string, operatorName: string, consultationUrl: string) {
  return smsService.sendSMS({
    to: phoneNumber,
    template: "consultation-reminder",
    variables: {
      operatorName,
      url: consultationUrl,
    },
  })
}

export async function sendVerificationCode(phoneNumber: string, code: string) {
  return smsService.sendSMS({
    to: phoneNumber,
    template: "verification-code",
    variables: {
      code,
    },
  })
}

export async function sendConsultationStarted(phoneNumber: string, operatorName: string, duration: number) {
  return smsService.sendSMS({
    to: phoneNumber,
    template: "consultation-started",
    variables: {
      operatorName,
      duration: duration.toString(),
    },
  })
}

export async function sendPaymentSuccess(phoneNumber: string, amount: number) {
  return smsService.sendSMS({
    to: phoneNumber,
    template: "payment-success",
    variables: {
      amount: amount.toFixed(2),
    },
  })
}

export async function sendLowCreditAlert(phoneNumber: string, balance: number, rechargeUrl: string) {
  return smsService.sendSMS({
    to: phoneNumber,
    template: "low-credit",
    variables: {
      balance: balance.toFixed(2),
      rechargeUrl,
    },
  })
}
