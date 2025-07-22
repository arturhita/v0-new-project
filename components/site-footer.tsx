import Link from "next/link"
import Image from "next/image"

const SiteFooter = () => {
  return (
    <footer className="bg-[#102A73] text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Servizi</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/esperti/cartomanzia" className="text-base text-gray-300 hover:text-white">
                  Cartomanzia
                </Link>
              </li>
              <li>
                <Link href="/esperti/astrologia" className="text-base text-gray-300 hover:text-white">
                  Astrologia
                </Link>
              </li>
              <li>
                <Link href="/esperti/tarocchi" className="text-base text-gray-300 hover:text-white">
                  Tarocchi
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Su di noi</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/chi-siamo" className="text-base text-gray-300 hover:text-white">
                  Chi Siamo
                </Link>
              </li>
              <li>
                <Link href="/diventa-esperto" className="text-base text-gray-300 hover:text-white">
                  Lavora con noi
                </Link>
              </li>
              <li>
                <Link href="/contatti" className="text-base text-gray-300 hover:text-white">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legale</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/legal/terms-and-conditions" className="text-base text-gray-300 hover:text-white">
                  Termini e Condizioni
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="text-base text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="text-base text-gray-300 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex items-start">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir"
              width={150}
              height={40}
              className="object-contain"
            />
          </div>
        </div>
        <div className="mt-8 border-t border-blue-800 pt-8 md:flex md:items-center md:justify-between">
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; 2025 Moonthir. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
