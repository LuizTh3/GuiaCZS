import { useState, useEffect, useRef } from 'react';
import { X, ImagePlus } from 'lucide-react';
import type { Place, Category } from '../../types';
import SubcategoryInput from './SubcategoryInput';

interface PublicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (place: Omit<Place, 'id'>) => Promise<void>;
  place?: Place | null;
}

const categories: { value: Category; label: string }[] = [
  { value: 'turismo', label: 'Turismo' },
  { value: 'estabelecimento', label: 'Estabelecimento' },
  { value: 'servico', label: 'Serviço' },
];

export default function PublicationForm({
  isOpen,
  onClose,
  onSave,
  place,
}: PublicationFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('estabelecimento');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (place) {
      setName(place.name);
      setCategory(place.category);
      setSubcategory(place.subcategory || '');
      setDescription(place.description);
      setAddress(place.address || '');
      setPhone(place.phone || '');
      setImage(place.image || '');
    } else {
      resetForm();
    }
  }, [place, isOpen]);

  const resetForm = () => {
    setName('');
    setCategory('estabelecimento');
    setSubcategory('');
    setDescription('');
    setAddress('');
    setPhone('');
    setImage('');
    setErrors({});
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Selecione um arquivo de imagem' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setErrors((prev) => ({ ...prev, image: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; image?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!place && !image) {
      newErrors.image = 'Imagem é obrigatória para novos registros';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        category,
        subcategory: subcategory.trim() || undefined,
        description: description.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        image,
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-primary">
            {place ? '✏️ Editar Publicação' : '➕ Adicionar Publicação'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Estabelecimento *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Supermercado São Luiz"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                    category === cat.value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={category === cat.value}
                    onChange={() => setCategory(cat.value)}
                    className="sr-only"
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </div>

          <SubcategoryInput
            value={subcategory}
            onChange={setSubcategory}
            category={category}
            isFormOpen={isOpen}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o estabelecimento..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Brasil, 1234 - Centro"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(68) 99999-9999"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem {place ? '(opcional para editar)' : '*'}
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-accent bg-accent/10'
                  : errors.image
                  ? 'border-red-300 hover:border-red-400'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                }}
                className="sr-only"
              />
              {image ? (
                <div className="relative">
                  <img
                    src={image}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2">Clique ou arraste para substituir</p>
                </div>
              ) : (
                <>
                  <ImagePlus className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">Arraste ou clique para selecionar</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG ou WEBP</p>
                </>
              )}
            </div>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
