import { ConstellationBackground } from "@/components/constellation-background"
import { Mail } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      <ConstellationBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-white">
        <div className="w-full max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 text-center shadow-2xl shadow-blue-500/10">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 mb-4">
            Contattaci
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Per qualsiasi richiesta di informazioni, supporto tecnico o domande, non esitare a scriverci.
          </p>
          <div className="inline-flex items-center justify-center p-4 rounded-lg bg-blue-900/30 border border-blue-500/30">
            <a
              href="mailto:infomoonthir@gmail.com"
              className="flex items-center space-x-3 text-xl font-medium text-gray-100 hover:text-white transition-colors"
            >
              <Mail className="h-6 w-6" />
              <span>infomoonthir@gmail.com</span>
            </a>
          </div>
          <p className="mt-8 text-sm text-gray-400">Il nostro team ti risponderà il prima possibile.</p>
        </div>
      </div>
    </div>
  )
}
