import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MailCheck } from "lucide-react"

export default function RegistrationConfirmPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center shadow-2xl rounded-2xl border-t-4 border-green-500">
        <CardHeader>
          <div className="mx-auto bg-green-500 text-white rounded-full p-4 w-fit mb-4">
            <MailCheck className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Registrazione Quasi Completa!</CardTitle>
          <CardDescription className="text-md text-gray-600 mt-2">
            Un ultimo passo per attivare il tuo account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">
            Ti abbiamo inviato un'email all'indirizzo che hai fornito. Per favore, controlla la tua casella di posta
            (anche la cartella spam!) e clicca sul link di conferma per attivare il tuo profilo di esperto.
          </p>
          <p className="text-sm text-gray-500">
            Una volta confermata l'email, potrai accedere al tuo pannello di controllo e iniziare a offrire le tue
            consulenze.
          </p>
          <div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/login">Vai alla pagina di Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
