import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Tag } from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Category, Subcategory } from '../../types';

interface SubcategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubcategoriesChange?: () => void;
}

const categories: { value: Category; label: string }[] = [
  { value: 'turismo', label: 'Turismo' },
  { value: 'estabelecimento', label: 'Estabelecimento' },
  { value: 'servico', label: 'Serviço' },
];

export default function SubcategoryManager({
  isOpen,
  onClose,
  onSubcategoriesChange,
}: SubcategoryManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('turismo');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSubcategories();
    }
  }, [isOpen, selectedCategory]);

  const loadSubcategories = async () => {
    setLoading(true);
    try {
      const subcategoriesRef = collection(db, 'subcategories');
      const q = query(
        subcategoriesRef,
        where('category', '==', selectedCategory),
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

  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim()) return;

    const exists = subcategories.some(
      (sub) => sub.name.toLowerCase() === newSubcategory.trim().toLowerCase()
    );

    if (exists) {
      return;
    }

    setAdding(true);
    try {
      const subcategoriesRef = collection(db, 'subcategories');
      await addDoc(subcategoriesRef, {
        name: newSubcategory.trim(),
        category: selectedCategory,
      });
      setNewSubcategory('');
      loadSubcategories();
      onSubcategoriesChange?.();
    } catch (error) {
      console.error('Erro ao adicionar subcategoria:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    setDeletingId(id);
    try {
      const subcategoryRef = doc(db, 'subcategories', id);
      await deleteDoc(subcategoryRef);
      setDeleteConfirm(null);
      loadSubcategories();
      onSubcategoriesChange?.();
    } catch (error) {
      console.error('Erro ao deletar subcategoria:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <Tag className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-primary">Gerenciar Subcategorias</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione a categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-5">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Subcategorias de "{categories.find((c) => c.value === selectedCategory)?.label}"
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              </div>
            ) : subcategories.length > 0 ? (
              <div className="space-y-2">
                {subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm text-gray-700">{sub.name}</span>
                    <button
                      onClick={() => setDeleteConfirm(sub.id)}
                      disabled={deletingId === sub.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remover"
                    >
                      {deletingId === sub.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Nenhuma subcategoria cadastrada para esta categoria.</p>
              </div>
            )}
          </div>

          <div className="border-t pt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar nova subcategoria
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcategory();
                  }
                }}
                placeholder="Nome da nova subcategoria..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
              <button
                onClick={handleAddSubcategory}
                disabled={!newSubcategory.trim() || adding}
                className="px-5 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Adicionar
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar remoção</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Deseja remover a subcategoria "
              {subcategories.find((s) => s.id === deleteConfirm)?.name}
              "?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSubcategory(deleteConfirm)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
