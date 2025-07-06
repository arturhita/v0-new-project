import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="bg-[#1E3C98] text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/moonthir-logo-white.png"
                alt="Moonthir Logo"
                width={140}
                height={40}
                className="object-contain"
              />
            </Link>
            <p className="text-blue-200 text-sm">
              La tua guida personale nel mondo della spiritualità. Connettiti con i migliori esperti per una consulenza
              autentica.
            </p>
          </div>

          {/* Piattaforma Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Piattaforma</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/esperti/cartomanti" className="text-blue-200 hover:text-white transition-colors">
                  Esperti
                </Link>
              </li>
              <li>
                <Link href="/oroscopo" className="text-blue-200 hover:text-white transition-colors">
                  Oroscopo
                </Link>
              </li>
              <li>
                <Link href="/astromag" className="text-blue-200 hover:text-white transition-colors">
                  AstroMag
                </Link>
              </li>
            </ul>
          </div>

          {/* Legale Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legale</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/privacy-policy" className="text-blue-200 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="text-blue-200 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-and-conditions" className="text-blue-200 hover:text-white transition-colors">
                  Termini e Condizioni
                </Link>
              </li>
            </ul>
          </div>

          {/* Risorse Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Risorse</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/diventa-esperto" className="text-blue-200 hover:text-white transition-colors">
                  Diventa Esperto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-blue-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-blue-300">
            &copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati.
          </p>
          {/* Social links can be added here */}
        </div>
      </div>
    </footer>
  )
}
