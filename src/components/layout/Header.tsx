import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MapPin, Search, X } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import type { Place } from '../../types';

interface HeaderProps {
  places: Place[];
}

export default function Header({ places }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = searchQuery
    ? places.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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
              <div className="relative">
                {isSearchOpen ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-40 sm:w-64 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="ml-2 p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                )}

                {searchQuery && filteredPlaces.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    {filteredPlaces.slice(0, 5).map((place) => (
                      <a
                        key={place.id}
                        href={`/${place.category}/${place.id}`}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium text-primary text-sm">{place.name}</p>
                        <p className="text-xs text-gray-500 truncate">{place.description}</p>
                      </a>
                    ))}
                  </div>
                )}
              </div>

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
