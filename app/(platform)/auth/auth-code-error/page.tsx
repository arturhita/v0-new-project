import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ConstellationBackground } from "@/components/constellation-background"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="backdrop-blur-sm bg-red-900/20 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Errore di Autenticazione</h1>
          <p className="text-red-200 mb-6">
            Il link che hai utilizzato non è valido o è scaduto. Potrebbe essere già stato usato.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg"
          >
            <Link href="/login">Torna al Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
