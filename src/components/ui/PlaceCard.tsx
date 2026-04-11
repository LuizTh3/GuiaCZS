import type { Place } from '../../types';
import { getCategoryLabel, getCategoryColor } from '../../data/mockData';

interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
}

export default function PlaceCard({ place, onClick }: PlaceCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={place.image}
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
    </div>
  );
}
