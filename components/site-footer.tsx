import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-transparent text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir Logo"
              width={160}
              height={45}
              className="object-contain"
            />
            <p className="text-gray-400 text-sm">
              La tua guida personale nel mondo dell'astrologia e della cartomanzia.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Servizi</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/tarocchi-online" className="text-base text-gray-400 hover:text-white">
                      Tarocchi
                    </Link>
                  </li>
                  <li>
                    <Link href="/oroscopo" className="text-base text-gray-400 hover:text-white">
                      Oroscopo
                    </Link>
                  </li>
                  <li>
                    <Link href="/esperti" className="text-base text-gray-400 hover:text-white">
                      Esperti
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Supporto</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/support" className="text-base text-gray-400 hover:text-white">
                      Contattaci
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-base text-gray-400 hover:text-white">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Azienda</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="#" className="text-base text-gray-400 hover:text-white">
                      Chi Siamo
                    </Link>
                  </li>
                  <li>
                    <Link href="/astromag" className="text-base text-gray-400 hover:text-white">
                      AstroMag
                    </Link>
                  </li>
                  <li>
                    <Link href="/diventa-esperto" className="text-base text-gray-400 hover:text-white">
                      Lavora con noi
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legale</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/legal/privacy-policy" className="text-base text-gray-400 hover:text-white">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/terms-and-conditions" className="text-base text-gray-400 hover:text-white">
                      Termini e Condizioni
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/cookie-policy" className="text-base text-gray-400 hover:text-white">
                      Cookie
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-blue-800/50 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  )
}
