import { Link } from 'react-router-dom';
import type { Group, Category } from '../../types';

interface GroupCardProps {
  group: Group;
  placeCount?: number;
}

const CATEGORY_LABELS: Record<Category, string> = {
  turismo: 'turismo',
  estabelecimento: 'estabelecimento',
  servico: 'serviço',
};

export default function GroupCard({ group, placeCount = 0 }: GroupCardProps) {
  const categoryLabel = CATEGORY_LABELS[group.category] || 'estabelecimento';
  const countLabel = placeCount === 1 
    ? categoryLabel 
    : categoryLabel === 'turismo' 
      ? 'turismos' 
      : categoryLabel === 'serviço' 
        ? 'serviços' 
        : 'estabelecimentos';

  const displayIcon = group.icon || group.image 
    ? (group.icon || <img src={group.image} alt={group.name} className="w-full h-full object-cover" />)
    : null;

  return (
    <Link
      to={`/grupo/${group.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-20 sm:h-24 overflow-hidden">
        {group.image ? (
          <>
            <img
              src={group.image}
              alt={group.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : null}
        {displayIcon && !group.image && (
          <div className={`absolute inset-0 flex items-center justify-center ${group.color}`}>
            <span className="text-4xl">{group.icon}</span>
          </div>
        )}
        {group.icon && group.image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">{group.icon}</span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3 text-center">
        <h3 className="font-bold text-sm text-primary line-clamp-1">
          {group.name}
        </h3>
        {placeCount > 0 && (
          <p className="text-xs text-gray-500 mt-0.5">
            {placeCount} {countLabel}
          </p>
        )}
      </div>
    </Link>
  );
}
