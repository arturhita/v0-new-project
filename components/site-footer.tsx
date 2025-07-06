import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={120} height={34} />
            </Link>
            <p className="text-sm">La tua guida nel mondo della cartomanzia e astrologia.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Servizi</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/esperti/cartomanzia" className="text-base text-slate-300 hover:text-white">
                  Cartomanzia
                </Link>
              </li>
              <li>
                <Link href="/esperti/astrologia" className="text-base text-slate-300 hover:text-white">
                  Astrologia
                </Link>
              </li>
              <li>
                <Link href="/tarocchi-online" className="text-base text-slate-300 hover:text-white">
                  Tarocchi Online
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legale</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/legal/terms-and-conditions" className="text-base text-slate-300 hover:text-white">
                  Termini e Condizioni
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="text-base text-slate-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="text-base text-slate-300 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Community</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/astromag" className="text-base text-slate-300 hover:text-white">
                  Astromag
                </Link>
              </li>
              <li>
                <Link href="/diventa-esperto" className="text-base text-slate-300 hover:text-white">
                  Lavora con noi
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-8 text-center">
          <p className="text-base text-slate-400">
            &copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  )
}
