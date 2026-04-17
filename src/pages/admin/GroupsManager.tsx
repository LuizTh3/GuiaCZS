import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, GripVertical, ImagePlus, Check, ChevronDown, Search } from 'lucide-react';
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
import Pagination from '../../components/ui/Pagination';
import type { Group, Subcategory, Category } from '../../types';

const ITEMS_PER_PAGE = 7;

const COLORS = [
  { name: 'Azul', value: 'bg-blue-500' },
  { name: 'Verde', value: 'bg-green-500' },
  { name: 'Vermelho', value: 'bg-red-500' },
  { name: 'Amarelo', value: 'bg-yellow-500' },
  { name: 'Roxo', value: 'bg-purple-500' },
  { name: 'Rosa', value: 'bg-pink-500' },
  { name: 'Laranja', value: 'bg-orange-500' },
  { name: 'Ciano', value: 'bg-cyan-500' },
];

const EMOJIS = ['🏍️', '🍕', '🏥', '🏠', '🚗', '💻', '📱', '🎓', '🏋️', '🎨', '🎵', '⚽', '🌿', '🔧', '📦'];

interface GroupFormData {
  name: string;
  slug: string;
  icon: string;
  image: string;
  color: string;
  category: Category;
  subcategories: string[];
  order: number;
  isActive: boolean;
}

const defaultFormData: GroupFormData = {
  name: '',
  slug: '',
  icon: '',
  image: '',
  color: 'bg-blue-500',
  category: 'estabelecimento',
  subcategories: [],
  order: 0,
  isActive: true,
};

interface GroupsManagerProps {
  onBack?: () => void;
}

export default function GroupsManager({ onBack }: GroupsManagerProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState<GroupFormData>(defaultFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);
  const [emojiDropdownOpen, setEmojiDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsSnapshot, subcategoriesSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'groups'), orderBy('order', 'asc'))),
        getDocs(query(collection(db, 'subcategories'), orderBy('name', 'asc'))),
      ]);

      setGroups(
        groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Group[]
      );

      setSubcategories(subcategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subcategory[]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenForm = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        slug: group.slug,
        icon: group.icon || '',
        image: group.image,
        color: group.color,
        category: group.category || 'estabelecimento',
        subcategories: group.subcategories,
        order: group.order,
        isActive: group.isActive,
      });
    } else {
      setEditingGroup(null);
      setFormData({
        ...defaultFormData,
        order: groups.length,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGroup(null);
    setFormData(defaultFormData);
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const toggleSubcategory = (subName: string) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(subName)
        ? prev.subcategories.filter((s) => s !== subName)
        : [...prev.subcategories, subName],
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      const data = {
        name: formData.name.trim(),
        slug: formData.slug || generateSlug(formData.name),
        icon: formData.icon,
        image: formData.image,
        color: formData.color,
        category: formData.category,
        subcategories: formData.subcategories,
        order: formData.order,
        isActive: formData.isActive,
      };

      if (editingGroup) {
        await updateDoc(doc(db, 'groups', editingGroup.id), {
          ...data,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'groups'), {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      handleCloseForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'groups', id));
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleToggleActive = async (group: Group) => {
    try {
      await updateDoc(doc(db, 'groups', group.id), {
        isActive: !group.isActive,
        updatedAt: new Date(),
      });
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const filteredGroups = groups.filter((group) => {
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    const matchesSearch = searchQuery === '' || group.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / ITEMS_PER_PAGE));
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-gray-50 -m-6 p-6 min-h-screen">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors font-medium inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Publicações
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary mb-2">Grupos</h1>
          <p className="text-gray-600">Gerencie os grupos de estabelecimentos</p>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleOpenForm()}
              className="px-5 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Grupo
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
                  <option value="all">Todas categorias</option>
                  <option value="estabelecimento">Estabelecimento</option>
                  <option value="servico">Serviço</option>
                  <option value="turismo">Turismo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  {filteredGroups.length} grupo(s) encontrado(s)
                </p>
                {paginatedGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      group.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {group.image ? (
                        <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                          {group.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">
                        {group.subcategories.length} subcategoria(s) • {group.subcategories.join(', ') || 'Nenhuma'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(group)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {group.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => handleOpenForm(group)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (group.id) {
                          setDeleteConfirm(group.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum grupo encontrado</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Tente ajustar seus filtros de busca'
                    : 'Comece adicionando seu primeiro grupo'}
                </p>
              </div>
            )}
          </div>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseForm} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-primary">
                {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
              </h2>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    }));
                  }}
                  placeholder="Ex: Moto-Táxi"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="moto-taxi"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">URL: /grupo/{formData.slug || 'slug'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone (Emoji)</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEmojiDropdownOpen(!emojiDropdownOpen)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center justify-between"
                  >
                    <span className="text-2xl">{formData.icon}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {emojiDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 grid grid-cols-5 gap-2">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, icon: emoji }));
                            setEmojiDropdownOpen(false);
                          }}
                          className={`p-2 text-2xl hover:bg-gray-100 rounded-lg ${
                            formData.icon === emoji ? 'bg-accent/10' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                      className={`w-8 h-8 rounded-full ${color.value} ${
                        formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as Category }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white"
                >
                  <option value="estabelecimento">Estabelecimento</option>
                  <option value="servico">Serviço</option>
                  <option value="turismo">Turismo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategorias ({formData.subcategories.length} selecionada(s))
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSubcategoryDropdownOpen(!subcategoryDropdownOpen)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-left flex items-center justify-between"
                  >
                    <span className="text-gray-500">
                      {formData.subcategories.length > 0
                        ? `${formData.subcategories.length} selecionada(s)`
                        : 'Selecione as subcategorias'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {subcategoryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {subcategories.length > 0 ? (
                        subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => toggleSubcategory(sub.name)}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700">{sub.name}</span>
                            {formData.subcategories.includes(sub.name) && (
                              <Check className="w-4 h-4 text-accent" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          Nenhuma subcategoria cadastrada
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {formData.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-xs"
                      >
                        {sub}
                        <button
                          type="button"
                          onClick={() => toggleSubcategory(sub)}
                          className="hover:bg-accent/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleImageSelect(file);
                    };
                    input.click();
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {formData.image ? (
                    <div className="relative">
                      <img src={formData.image} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                      <p className="text-xs text-gray-500 mt-2">Clique para substituir</p>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Arraste ou clique para selecionar</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.isActive ? 'bg-accent' : 'bg-gray-300'
                  } relative`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.isActive ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700">
                  {formData.isActive ? 'Grupo ativo' : 'Grupo inativo'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCloseForm}
                className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar remoção</h3>
            <p className="text-gray-600 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
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
