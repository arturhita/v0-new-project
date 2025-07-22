import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900/50 text-gray-300 border-t border-cyan-400/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={120} height={30} />
            </Link>
            <p className="text-sm text-gray-400">
              La nuova dimensione della cartomanzia online. Risposte, guida e ascolto autentico.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-cyan-300">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-cyan-300">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-cyan-300">
                <Twitter size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cyan-300 tracking-wider uppercase">Piattaforma</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/esperti" className="text-base text-gray-400 hover:text-white">
                  I nostri Esperti
                </Link>
              </li>
              <li>
                <Link href="/diventa-esperto" className="text-base text-gray-400 hover:text-white">
                  Diventa Esperto
                </Link>
              </li>
              <li>
                <Link href="/astromag" className="text-base text-gray-400 hover:text-white">
                  Astromag
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cyan-300 tracking-wider uppercase">Informazioni</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/chi-siamo" className="text-base text-gray-400 hover:text-white">
                  Chi Siamo
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-base text-gray-400 hover:text-white">
                  Contattaci
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cyan-300 tracking-wider uppercase">Legale</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/legal/privacy-policy" className="text-base text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="text-base text-gray-400 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-and-conditions" className="text-base text-gray-400 hover:text-white">
                  Termini e Condizioni
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700/50 pt-8 text-center">
          <p className="text-base text-gray-500">
            &copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  )
}
