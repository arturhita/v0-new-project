import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/">
              <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={50} />
            </Link>
            <p className="text-sm text-slate-400">La tua guida nel mondo della cartomanzia e astrologia.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">Servizi</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/esperti/cartomanzia" className="text-slate-400 hover:text-white">
                  Esperti
                </Link>
              </li>
              <li>
                <Link href="/tarocchi-online" className="text-slate-400 hover:text-white">
                  Tarocchi Online
                </Link>
              </li>
              <li>
                <Link href="/oroscopo" className="text-slate-400 hover:text-white">
                  Oroscopo
                </Link>
              </li>
              <li>
                <Link href="/affinita-di-coppia" className="text-slate-400 hover:text-white">
                  Affinità di Coppia
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Informazioni</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/diventa-esperto" className="text-slate-400 hover:text-white">
                  Lavora con noi
                </Link>
              </li>
              <li>
                <Link href="/astromag" className="text-slate-400 hover:text-white">
                  Astromag
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Legale</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/legal/terms-and-conditions" className="text-slate-400 hover:text-white">
                  Termini e Condizioni
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="text-slate-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="text-slate-400 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}
