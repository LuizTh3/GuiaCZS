import type { Subcategory } from '../../types';

interface SubcategoryChipsProps {
  subcategories: Subcategory[];
  selected: string;
  onSelect: (sub: string) => void;
}

export default function SubcategoryChips({ subcategories, selected, onSelect }: SubcategoryChipsProps) {
  if (subcategories.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 py-2 rounded-full font-medium transition-all ${
          selected === 'all'
            ? 'bg-accent text-white shadow-lg shadow-accent/30'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        Todos
      </button>
      {subcategories.map((sub) => (
        <button
          key={sub.id}
          onClick={() => onSelect(sub.name)}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selected === sub.name
              ? 'bg-accent text-white shadow-lg shadow-accent/30'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {sub.name}
        </button>
      ))}
    </div>
  );
}
