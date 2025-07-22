import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={120} height={30} />
            </Link>
            <p className="mt-4 text-sm text-slate-400">
              La tua guida nel mondo dell'astrologia e della cartomanzia. Connettiti con i migliori esperti.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="#" className="text-slate-400 hover:text-white">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <Twitter size={20} />
              </Link>
            </div>
          </div>

          {/* Links sections */}
          <div>
            <h3 className="font-bold text-white tracking-wide">Piattaforma</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/esperti" className="text-slate-400 hover:text-white">
                  I nostri Esperti
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
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white tracking-wide">Legale</h3>
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

          <div>
            <h3 className="font-bold text-white tracking-wide">Servizi</h3>
            <ul className="mt-4 space-y-2 text-sm">
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
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati.</p>
          <p className="mt-2">
            Piattaforma di consulenza per maggiorenni. Il servizio è da intendersi come intrattenimento.
          </p>
        </div>
      </div>
    </footer>
  )
}
