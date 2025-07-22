import Link from "next/link"
import Image from "next/image"

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={50} />
            <p className="mt-4 text-gray-400 text-sm">
              La tua guida personale nel mondo della spiritualità e del benessere.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Servizi</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/esperti" className="text-gray-400 hover:text-white">
                  I nostri Esperti
                </Link>
              </li>
              <li>
                <Link href="/tarocchi-online" className="text-gray-400 hover:text-white">
                  Tarocchi Online
                </Link>
              </li>
              <li>
                <Link href="/astromag" className="text-gray-400 hover:text-white">
                  AstroMag
                </Link>
              </li>
              <li>
                <Link href="/oroscopo" className="text-gray-400 hover:text-white">
                  Oroscopo del Giorno
                </Link>
              </li>
              <li>
                <Link href="/affinita-di-coppia" className="text-gray-400 hover:text-white">
                  Affinità di Coppia
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Informazioni</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/diventa-esperto" className="text-gray-400 hover:text-white">
                  Lavora con noi
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-and-conditions" className="text-gray-400 hover:text-white">
                  Termini e Condizioni
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="text-gray-400 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white">
                  Supporto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Seguici</h3>
            <div className="flex mt-4 space-x-4">
              {/* Placeholder for social media icons */}
              <a href="#" className="text-gray-400 hover:text-white">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati.</p>
          <p className="mt-2">Servizio di consulenza telefonica offerto da terzi. Vietato ai minori di 18 anni.</p>
        </div>
      </div>
    </footer>
  )
}
