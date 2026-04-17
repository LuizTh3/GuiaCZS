import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MapPin } from 'lucide-react';
import MobileDrawer from './MobileDrawer';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/icon.webp" alt="Guia da Cidade" className="w-10 h-10" />
              <div className="hidden sm:block">
                <span className="font-bold text-primary text-lg">Guia da Cidade</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  Cruzeiro do Sul – AC
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/turismo" className="text-gray-700 hover:text-accent font-medium transition-colors">
                Turismo
              </Link>
              <Link to="/estabelecimentos" className="text-gray-700 hover:text-accent font-medium transition-colors">
                Estabelecimentos
              </Link>
              <Link to="/servicos" className="text-gray-700 hover:text-accent font-medium transition-colors">
                Serviços
              </Link>
              <Link
                to="/admin"
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
              >
                Admin
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
