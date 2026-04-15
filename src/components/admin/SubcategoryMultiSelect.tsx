import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Category, Subcategory } from '../../types';

interface SubcategoryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  category: Category;
  isFormOpen?: boolean;
}

export default function SubcategoryMultiSelect({
  value,
  onChange,
  category,
  isFormOpen,
}: SubcategoryMultiSelectProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFormOpen) {
      loadSubcategories();
    }
  }, [isFormOpen, category]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSubcategories = async () => {
    setLoading(true);
    try {
      const subcategoriesRef = collection(db, 'subcategories');
      const q = query(
        subcategoriesRef,
        where('category', '==', category),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subcategory[];
      setSubcategories(data);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableSubcategories = subcategories.filter(
    (sub) => !value.includes(sub.name)
  );

  const filteredSubcategories = availableSubcategories.filter((sub) =>
    sub.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (sub: Subcategory) => {
    onChange([...value, sub.name]);
    setSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (subToRemove: string) => {
    onChange(value.filter((sub) => sub !== subToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && search === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Subcategorias
      </label>
      <div className="relative">
        <div className="min-h-[48px] px-3 py-2 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-accent/50 transition-all bg-white flex flex-wrap gap-2 items-center">
          {value.map((sub) => (
            <span
              key={sub}
              className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
            >
              {sub}
              <button
                type="button"
                onClick={() => handleRemove(sub)}
                className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? 'Selecione ou digite...' : ''}
            className="flex-1 min-w-[120px] py-1 outline-none bg-transparent placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Carregando...
            </div>
          ) : filteredSubcategories.length > 0 ? (
            <div className="max-h-48 overflow-y-auto">
              {filteredSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSelect(sub)}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">{sub.name}</span>
                  <span className="text-xs text-gray-400">+ adicionar</span>
                </button>
              ))}
            </div>
          ) : search.trim() ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Nenhuma subcategoria encontrada
            </div>
          ) : subcategories.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Nenhuma subcategoria cadastrada.{' '}
              <a
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="text-accent hover:underline"
              >
                Clique aqui para gerenciar
              </a>
            </div>
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">
              Todas as subcategorias já foram selecionadas
            </div>
          )}
        </div>
      )}
    </div>
  );
}
