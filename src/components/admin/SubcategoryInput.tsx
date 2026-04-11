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

interface SubcategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  category: Category;
  isFormOpen?: boolean;
}

export default function SubcategoryInput({
  value,
  onChange,
  category,
  isFormOpen,
}: SubcategoryInputProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  const filteredSubcategories = subcategories.filter((sub) =>
    sub.name.toLowerCase().includes(value.toLowerCase())
  );

  const exactMatch = subcategories.some(
    (sub) => sub.name.toLowerCase() === value.toLowerCase().trim()
  );

  const handleSelect = (sub: Subcategory) => {
    onChange(sub.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Subcategoria
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Selecione ou digite..."
          className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded-full"
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
                  {value.toLowerCase() === sub.name.toLowerCase() && (
                    <span className="text-xs text-accent">✓</span>
                  )}
                </button>
              ))}
            </div>
          ) : value.trim() && !exactMatch ? (
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
              Comece a digitar para filtrar
            </div>
          )}
        </div>
      )}
    </div>
  );
}
