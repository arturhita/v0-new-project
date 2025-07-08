import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

const SiteFooter = () => {
  const legalLinks = [
    { href: "/legal/terms-and-conditions", label: "Termini e Condizioni" },
    { href: "/legal/privacy-policy", label: "Privacy Policy" },
    { href: "/legal/cookie-policy", label: "Cookie Policy" },
  ]

  const socialLinks = [
    { href: "#", icon: Facebook, label: "Facebook" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
    { href: "#", icon: Linkedin, label: "LinkedIn" },
  ]

  return (
    <footer className="bg-blue-900/50 text-slate-300 border-t border-blue-800/50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={40} />
            <p className="text-sm">
              Scopri il tuo futuro con i nostri esperti. Consulenze di cartomanzia e astrologia.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-slate-400 hover:text-yellow-400 transition-colors"
                >
                  <social.icon className="h-6 w-6" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
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
                <Link href="/oroscopo" className="text-base text-slate-300 hover:text-white">
                  Oroscopo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legale</h3>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-base text-slate-300 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Supporto</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/support" className="text-base text-slate-300 hover:text-white">
                  Contattaci
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-slate-300 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-blue-800/50 pt-8 text-center">
          <p className="text-base text-slate-400">
            &copy; {new Date().getFullYear()} Moonthir. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
