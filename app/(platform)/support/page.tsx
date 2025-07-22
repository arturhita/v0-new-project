import { Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ConstellationBackground from "@/components/constellation-background"

export default function SupportPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a192f]">
      <ConstellationBackground />
      <main className="relative z-10 flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-2xl bg-slate-900/80 border-cyan-400/20 text-gray-200 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-cyan-300 tracking-wider">Contattaci</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-lg text-gray-300">
              Per qualsiasi richiesta di informazioni, supporto o chiarimento, il nostro team è a tua disposizione.
            </p>
            <div className="flex items-center justify-center space-x-3 bg-slate-800/50 p-4 rounded-lg border border-cyan-400/30">
              <Mail className="h-6 w-6 text-cyan-400" />
              <a
                href="mailto:infomoonthir@gmail.com"
                className="text-xl font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                infomoonthir@gmail.com
              </a>
            </div>
            <p className="text-gray-400">Ti risponderemo nel più breve tempo possibile.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
