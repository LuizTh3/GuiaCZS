import { Link } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/icon.webp" alt="Guia da Cidade" className="w-8 h-8" />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-bold text-lg">Painel Admin</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-white/70">Administrador</p>
            </div>
            <Link
              to="/"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              Ver Site
            </Link>
            <button
              onClick={logout}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
