"use server"

// --- ATTENZIONE: SERVIZIO EMAIL SIMULATO ---
// Questo file simula l'invio di email stampando i dati nella console del server.
// Per un'applicazione in produzione, è necessario sostituire questa logica
// con un vero servizio di invio email come Resend, SendGrid, o AWS SES.
//
// Passi per l'integrazione di un servizio reale (es. Resend):
// 1. Registrati su https://resend.com e ottieni una API key.
// 2. Aggiungi la API key alle variabili d'ambiente (es. RESEND_API_KEY).
// 3. Installa il pacchetto: `npm install resend`.
// 4. Modifica la funzione `sendEmail` per usare `resend.emails.send({...})`.
// ---------------------------------------------

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
}

export interface EmailData {
  to: string | string[]
  subject: string
  template: string
  variables?: Record<string, any>
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

class EmailService {
  private templates: Map<string, EmailTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates() {
    // Template Benvenuto
    this.templates.set("welcome", {
      id: "welcome",
      name: "Benvenuto",
      subject: "Benvenuto su Unveilly - La tua consulenza inizia qui",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #0ea5e9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Benvenuto su Unveilly!</h1>
              <p>La piattaforma di consulenza più innovativa d'Italia</p>
            </div>
            <div class="content">
              <h2>Ciao {{userName}}!</h2>
              <p>Siamo entusiasti di averti con noi. Unveilly ti connette con i migliori esperti in astrologia, cartomanzia, coaching e molto altro.</p>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">500+</div>
                  <div>Esperti Certificati</div>
                </div>
                <div class="stat">
                  <div class="stat-number">50k+</div>
                  <div>Consulenze Completate</div>
                </div>
                <div class="stat">
                  <div class="stat-number">4.8★</div>
                  <div>Rating Medio</div>
                </div>
              </div>

              <h3>🚀 Inizia subito:</h3>
              <ul>
                <li>✨ Esplora i nostri esperti nelle diverse categorie</li>
                <li>💬 Inizia una chat o prenota una chiamata</li>
                <li>🎯 Ricevi consigli personalizzati</li>
                <li>⭐ Lascia recensioni per aiutare altri utenti</li>
              </ul>

              <a href="{{dashboardUrl}}" class="button">Vai alla Dashboard</a>

              <p><strong>Hai domande?</strong> Il nostro team di supporto è sempre disponibile per aiutarti.</p>
            </div>
            <div class="footer">
              <p>© 2024 Unveilly. Tutti i diritti riservati.</p>
              <p><a href="{{unsubscribeUrl}}">Disiscriviti</a> | <a href="{{supportUrl}}">Supporto</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `Benvenuto su Unveilly, {{userName}}! La tua consulenza inizia qui.`,
      variables: ["userName", "dashboardUrl", "unsubscribeUrl", "supportUrl"],
    })

    // Template Conferma Consulenza
    this.templates.set("consultation-confirmed", {
      id: "consultation-confirmed",
      name: "Conferma Consulenza",
      subject: "✅ Consulenza confermata con {{operatorName}}",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .consultation-card { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button-secondary { background: #6b7280; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { background: #f9fafb; padding: 15px; border-radius: 6px; }
            .info-label { font-weight: bold; color: #374151; }
            .info-value { color: #0ea5e9; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Consulenza Confermata!</h1>
              <p>Il tuo appuntamento è stato prenotato con successo</p>
            </div>
            <div class="content">
              <h2>Ciao {{clientName}}!</h2>
              <p>La tua consulenza con <strong>{{operatorName}}</strong> è stata confermata.</p>
              
              <div class="consultation-card">
                <h3>📅 Dettagli Consulenza</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Esperto</div>
                    <div class="info-value">{{operatorName}}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Specializzazione</div>
                    <div class="info-value">{{category}}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Data e Ora</div>
                    <div class="info-value">{{dateTime}}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Durata</div>
                    <div class="info-value">{{duration}} minuti</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Tipo</div>
                    <div class="info-value">{{consultationType}}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Costo</div>
                    <div class="info-value">€{{amount}}</div>
                  </div>
                </div>
              </div>

              <h3>🔔 Promemoria:</h3>
              <ul>
                <li>📱 Riceverai una notifica 15 minuti prima dell'inizio</li>
                <li>💻 Assicurati di avere una connessione internet stabile</li>
                <li>🎧 Per le chiamate, testa audio e microfono in anticipo</li>
                <li>📝 Prepara le domande che vuoi porre</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{consultationUrl}}" class="button">Vai alla Consulenza</a>
                <a href="{{rescheduleUrl}}" class="button button-secondary">Riprogramma</a>
              </div>

              <p><strong>Hai bisogno di aiuto?</strong> Contatta il nostro supporto 24/7.</p>
            </div>
            <div class="footer">
              <p>© 2024 Unveilly. Tutti i diritti riservati.</p>
              <p>ID Consulenza: {{consultationId}}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `Consulenza confermata con {{operatorName}} per il {{dateTime}}. ID: {{consultationId}}`,
      variables: [
        "clientName",
        "operatorName",
        "category",
        "dateTime",
        "duration",
        "consultationType",
        "amount",
        "consultationUrl",
        "rescheduleUrl",
        "consultationId",
      ],
    })

    // Template Newsletter
    this.templates.set("newsletter", {
      id: "newsletter",
      name: "Newsletter",
      subject: "🌟 {{subject}} - Newsletter Unveilly",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .article { border-bottom: 1px solid #e5e7eb; padding: 20px 0; }
            .article:last-child { border-bottom: none; }
            .article-title { color: #7c3aed; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .article-excerpt { color: #6b7280; margin-bottom: 15px; }
            .read-more { color: #7c3aed; text-decoration: none; font-weight: 600; }
            .featured-operators { background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .operator-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px; }
            .operator-card { text-align: center; background: white; padding: 15px; border-radius: 6px; }
            .operator-avatar { width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 10px; }
            .cta-section { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0; }
            .cta-button { display: inline-block; background: white; color: #0ea5e9; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Newsletter Unveilly</h1>
              <p>{{subject}}</p>
            </div>
            <div class="content">
              <h2>Ciao {{userName}}!</h2>
              <p>{{introText}}</p>

              {{#if featuredArticles}}
              <h3>📰 Articoli in Evidenza</h3>
              {{#each featuredArticles}}
              <div class="article">
                <div class="article-title">{{title}}</div>
                <div class="article-excerpt">{{excerpt}}</div>
                <a href="{{url}}" class="read-more">Leggi tutto →</a>
              </div>
              {{/each}}
              {{/if}}

              {{#if featuredOperators}}
              <div class="featured-operators">
                <h3>⭐ Esperti in Evidenza</h3>
                <div class="operator-grid">
                  {{#each featuredOperators}}
                  <div class="operator-card">
                    <img src="{{avatar}}" alt="{{name}}" class="operator-avatar">
                    <div><strong>{{name}}</strong></div>
                    <div style="color: #6b7280; font-size: 14px;">{{specialization}}</div>
                    <div style="color: #f59e0b; font-size: 14px;">⭐ {{rating}}</div>
                  </div>
                  {{/each}}
                </div>
              </div>
              {{/if}}

              <div class="cta-section">
                <h3>🚀 Inizia la tua consulenza oggi!</h3>
                <p>Scopri cosa ti riserva il futuro con i nostri esperti certificati</p>
                <a href="{{ctaUrl}}" class="cta-button">Esplora Esperti</a>
              </div>

              {{#if promotions}}
              <h3>🎁 Offerte Speciali</h3>
              {{#each promotions}}
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 10px 0;">
                <strong>{{title}}</strong><br>
                {{description}}<br>
                <small style="color: #92400e;">Valido fino al {{expiryDate}}</small>
              </div>
              {{/each}}
              {{/if}}
            </div>
            <div class="footer">
              <p>© 2024 Unveilly. Tutti i diritti riservati.</p>
              <p><a href="{{unsubscribeUrl}}">Disiscriviti</a> | <a href="{{preferencesUrl}}">Preferenze Email</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `Newsletter Unveilly - {{subject}}. {{introText}}`,
      variables: [
        "userName",
        "subject",
        "introText",
        "featuredArticles",
        "featuredOperators",
        "ctaUrl",
        "promotions",
        "unsubscribeUrl",
        "preferencesUrl",
      ],
    })

    // Template Reset Password
    this.templates.set("reset-password", {
      id: "reset-password",
      name: "Reset Password",
      subject: "🔐 Reset della tua password Unveilly",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .reset-card { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .security-tips { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Password</h1>
              <p>Richiesta di reimpostazione password</p>
            </div>
            <div class="content">
              <h2>Ciao {{userName}}!</h2>
              <p>Hai richiesto di reimpostare la password del tuo account Unveilly.</p>
              
              <div class="reset-card">
                <h3>🔑 Reimposta la tua password</h3>
                <p>Clicca sul pulsante qui sotto per creare una nuova password sicura.</p>
                <a href="{{resetUrl}}" class="button">Reimposta Password</a>
                <p><small>Questo link è valido per 1 ora</small></p>
              </div>

              <div class="warning">
                <strong>⚠️ Non hai richiesto questo reset?</strong><br>
                Se non hai richiesto la reimpostazione della password, ignora questa email. Il tuo account rimane sicuro.
              </div>

              <div class="security-tips">
                <h4>💡 Consigli per una password sicura:</h4>
                <ul>
                  <li>Usa almeno 8 caratteri</li>
                  <li>Combina lettere maiuscole e minuscole</li>
                  <li>Includi numeri e simboli</li>
                  <li>Non usare informazioni personali</li>
                  <li>Non riutilizzare password di altri siti</li>
                </ul>
              </div>

              <p>Se hai problemi, contatta il nostro supporto tecnico.</p>
            </div>
            <div class="footer">
              <p>© 2024 Unveilly. Tutti i diritti riservati.</p>
              <p>Questo è un messaggio automatico, non rispondere a questa email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `Reset password richiesto per {{userName}}. Link: {{resetUrl}} (valido 1 ora)`,
      variables: ["userName", "resetUrl"],
    })
  }

  async sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.templates.get(data.template)
      if (!template) {
        throw new Error(`Template ${data.template} non trovato`)
      }

      let htmlContent = template.htmlContent
      let textContent = template.textContent
      let subject = data.subject || template.subject

      if (data.variables) {
        Object.entries(data.variables).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, "g")
          htmlContent = htmlContent.replace(regex, String(value))
          textContent = textContent.replace(regex, String(value))
          subject = subject.replace(regex, String(value))
        })
      }

      console.log("📧 [SIMULAZIONE EMAIL] Invio email in corso...")
      console.log("-------------------------------------------")
      console.log(`A: ${Array.isArray(data.to) ? data.to.join(", ") : data.to}`)
      console.log(`Oggetto: ${subject}`)
      console.log(`Template: ${data.template}`)
      console.log("-------------------------------------------")

      await new Promise((resolve) => setTimeout(resolve, 500))

      const messageId = `simulated_${Date.now()}`

      return {
        success: true,
        messageId,
      }
    } catch (error) {
      console.error("❌ Errore simulazione invio email:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Errore sconosciuto",
      }
    }
  }

  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId)
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values())
  }
}

export const emailService = new EmailService()

// Funzioni helper per invii comuni
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  return emailService.sendEmail({
    to: userEmail,
    template: "welcome",
    subject: "Benvenuto su Unveilly - La tua consulenza inizia qui",
    variables: {
      userName,
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe`,
      supportUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
    },
  })
}

export async function sendConsultationConfirmation(
  clientEmail: string,
  clientName: string,
  operatorName: string,
  consultationDetails: {
    category: string
    dateTime: string
    duration: number
    consultationType: string
    amount: number
    consultationId: string
  },
) {
  return emailService.sendEmail({
    to: clientEmail,
    template: "consultation-confirmed",
    subject: `✅ Consulenza confermata con ${operatorName}`,
    variables: {
      clientName,
      operatorName,
      ...consultationDetails,
      consultationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/consultation/${consultationDetails.consultationId}`,
      rescheduleUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/reschedule/${consultationDetails.consultationId}`,
    },
  })
}

export async function sendPasswordReset(userEmail: string, userName: string, resetToken: string) {
  return emailService.sendEmail({
    to: userEmail,
    template: "reset-password",
    subject: "🔐 Reset della tua password Unveilly",
    variables: {
      userName,
      resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`,
    },
  })
}

export async function sendNewsletter(
  recipients: string[],
  subject: string,
  content: {
    introText: string
    featuredArticles?: Array<{ title: string; excerpt: string; url: string }>
    featuredOperators?: Array<{ name: string; avatar: string; specialization: string; rating: number }>
    promotions?: Array<{ title: string; description: string; expiryDate: string }>
  },
) {
  const results = []

  for (const email of recipients) {
    const result = await emailService.sendEmail({
      to: email,
      template: "newsletter",
      subject: `🌟 ${subject} - Newsletter Unveilly`,
      variables: {
        userName: email.split("@")[0], // Fallback se non abbiamo il nome
        subject,
        ...content,
        ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/maestri`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${email}`,
        preferencesUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/email-preferences?email=${email}`,
      },
    })
    results.push({ email, ...result })
  }

  return results
}
