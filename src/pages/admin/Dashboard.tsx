import { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, CheckCircle, XCircle, Tag } from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminHeader from '../../components/layout/AdminHeader';
import PublicationItem from '../../components/admin/PublicationItem';
import PublicationForm from '../../components/admin/PublicationForm';
import SubcategoryManager from '../../components/admin/SubcategoryManager';
import type { Place, Category, Subcategory } from '../../types';

const categories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'turismo', label: 'Turismo' },
  { value: 'estabelecimento', label: 'Estabelecimentos' },
  { value: 'servico', label: 'Serviços' },
];

export default function Dashboard() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubcategoryManagerOpen, setIsSubcategoryManagerOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadPlaces();
    loadSubcategories();
  }, []);

  useEffect(() => {
    setSelectedSubcategory('all');
  }, [selectedCategory]);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const placesRef = collection(db, 'places');
      const q = query(placesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const placesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Place[];
      setPlaces(placesData);
    } catch (error) {
      console.error('Erro ao carregar publicações:', error);
      showNotification('error', 'Erro ao carregar publicações');
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async () => {
    try {
      const subcategoriesRef = collection(db, 'subcategories');
      const q = query(subcategoriesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subcategory[];
      setSubcategories(data);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
    }
  };

  const getFilteredSubcategories = () => {
    if (selectedCategory === 'all') {
      return subcategories;
    }
    return subcategories.filter((sub) => sub.category === selectedCategory);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async (placeData: Omit<Place, 'id'>) => {
    try {
      if (editingPlace) {
        const placeRef = doc(db, 'places', editingPlace.id);
        await updateDoc(placeRef, {
          ...placeData,
          updatedAt: new Date(),
        });
        showNotification('success', 'Publicação atualizada com sucesso!');
      } else {
        await addDoc(collection(db, 'places'), {
          ...placeData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        showNotification('success', 'Publicação criada com sucesso!');
      }
      loadPlaces();
      setEditingPlace(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showNotification('error', 'Erro ao salvar publicação');
      throw error;
    }
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const placeRef = doc(db, 'places', deleteConfirm);
      await deleteDoc(placeRef);
      showNotification('success', 'Publicação removida com sucesso!');
      loadPlaces();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      showNotification('error', 'Erro ao remover publicação');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredPlaces = places.filter((place) => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSubcategory =
      selectedSubcategory === 'all' ||
      (place.subcategories?.includes(selectedSubcategory) ?? false);
    const matchesSearch =
      searchQuery === '' ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Publicações</h1>
          <p className="text-gray-600">Gerencie as publicações do Guia da Cidade</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setEditingPlace(null);
                  setIsFormOpen(true);
                }}
                className="px-5 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Novo
              </button>

              <button
                onClick={() => setIsSubcategoryManagerOpen(true)}
                className="px-5 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Tag className="w-5 h-5" />
                Gerenciar Subcategorias
              </button>

              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all bg-white"
                >
                  <option value="all">Todas subcategorias</option>
                  {getFilteredSubcategories().map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            ) : filteredPlaces.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  {filteredPlaces.length} publicação(ões) encontrada(s)
                </p>
                {filteredPlaces.map((place) => (
                  <PublicationItem
                    key={place.id}
                    place={place}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma publicação encontrada</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Tente ajustar seus filtros de busca'
                    : 'Comece adicionando sua primeira publicação'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicationForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPlace(null);
        }}
        onSave={handleSave}
        place={editingPlace}
      />

      <SubcategoryManager
        isOpen={isSubcategoryManagerOpen}
        onClose={() => setIsSubcategoryManagerOpen(false)}
        onSubcategoriesChange={loadSubcategories}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar remoção</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja remover esta publicação? Esta ação é permanente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-tertiary text-primary'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}
    </div>
  );
}
