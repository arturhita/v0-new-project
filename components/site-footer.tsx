import Link from "next/link"
import Image from "next/image"

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900/50 text-slate-300 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={40} />
            <p className="mt-4 text-sm text-slate-400">La tua guida nel mondo della cartomanzia e dell'astrologia.</p>
          </div>
          <div>
            <h3 className="font-bold text-white">Servizi</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/tarocchi-online" className="hover:text-white">
                  Tarocchi Online
                </Link>
              </li>
              <li>
                <Link href="/oroscopo" className="hover:text-white">
                  Oroscopo
                </Link>
              </li>
              <li>
                <Link href="/affinita-di-coppia" className="hover:text-white">
                  Affinità di Coppia
                </Link>
              </li>
              <li>
                <Link href="/esperti/cartomanzia" className="hover:text-white">
                  I nostri Esperti
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">Informazioni</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white">
                  Domande Frequenti
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-and-conditions" className="hover:text-white">
                  Termini e Condizioni
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">Seguici</h3>
            <div className="flex mt-4 space-x-4">
              {/* Placeholder for social icons */}
              <a href="#" className="text-slate-400 hover:text-white">
                Facebook
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                Instagram
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                TikTok
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati. Servizio di cartomanzia
            professionale.
          </p>
        </div>
      </div>
    </footer>
  )
}
