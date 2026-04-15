import { Pencil, Trash2, MapPin, Phone } from 'lucide-react';
import type { Place } from '../../types';
import { getCategoryLabel, getCategoryColor } from '../../data/mockData';

interface PublicationItemProps {
  place: Place;
  onEdit: (place: Place) => void;
  onDelete: (id: string) => void;
}

export default function PublicationItem({ place, onEdit, onDelete }: PublicationItemProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-32 h-24 sm:h-auto flex-shrink-0">
          <img
            src={place.image || 'https://via.placeholder.com/150x100?text=Sem+imagem'}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(
                    place.category
                  )}`}
                >
                  {getCategoryLabel(place.category)}
                </span>
                {place.subcategories && place.subcategories.map((sub) => (
                  <span key={sub} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    {sub}
                  </span>
                ))}
              </div>
              <h3 className="font-bold text-lg text-primary truncate">{place.name}</h3>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(place)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(place.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{place.description}</p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
            {place.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {place.address}
              </span>
            )}
            {place.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {place.phone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
