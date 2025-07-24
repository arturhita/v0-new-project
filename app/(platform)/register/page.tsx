import { RegisterForm } from "@/components/register-form"
import Image from "next/image"

// Pagina di registrazione semplificata, si integra nel layout principale
export default function RegisterPage() {
  return (
    <div className="flex flex-grow items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-yellow-500/20 bg-gray-950/50 p-8 shadow-2xl shadow-yellow-500/10 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={50} className="mb-6" />
          <h1 className="text-3xl font-bold text-white">Crea il tuo Account</h1>
          <p className="mt-2 text-gray-300/70">Unisciti alla nostra community e scopri i segreti delle stelle.</p>
        </div>
        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
