import { X, MapPin } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'Início', href: '/' },
  { label: 'Turismo', href: '/turismo' },
  { label: 'Estabelecimentos', href: '/estabelecimentos' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Painel Admin', href: '/admin' },
];

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <img src="/icon.webp" alt="Guia da Cidade" className="w-8 h-8" />
            <span className="font-bold text-primary">Guia da Cidade</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                item.href === '/'
                  ? 'bg-tertiary/10 text-secondary font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label === 'Início' && <MapPin className="w-5 h-5" />}
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
