import { Link } from 'react-router-dom';
import type { Place, Category } from '../../types';
import { getCategoryLabel, getCategoryColor } from '../../data/mockData';

const CATEGORY_ROUTES: Record<Category, string> = {
  turismo: 'turismo',
  estabelecimento: 'estabelecimentos',
  servico: 'servicos',
};

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const linkTo = `/${CATEGORY_ROUTES[place.category]}/${place.id}`;

  return (
    <Link
      to={linkTo}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={place.image || 'https://via.placeholder.com/400x300?text=Sem+imagem'}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
            place.category
          )}`}
        >
          {getCategoryLabel(place.category)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-primary mb-2 line-clamp-1">
          {place.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {place.description}
        </p>
      </div>
    </Link>
  );
}
