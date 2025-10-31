import Link from 'next/link'
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-white mt-20 transition-colors duration-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">TopCell</h3>
            <p className="text-gray-400">
              Sua loja confiável para os melhores eletrônicos, smartphones e gadgets.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/products" className="hover:text-white transition-all duration-300">
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link href="/products?category=smartphones" className="hover:text-white transition-all duration-300">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link href="/products?category=laptops" className="hover:text-white transition-all duration-300">
                  Notebooks
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-white transition-all duration-300">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/#about-section" className="hover:text-white transition-all duration-300">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-all duration-300">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-all duration-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-all duration-300">
                  Envio e Devolução
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Siga-nos</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition">
                <FiFacebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <FiInstagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <FiTwitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 TopCell. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

