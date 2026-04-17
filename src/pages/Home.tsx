import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, MapPin, Layers, Tag } from 'lucide-react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PlaceCard from '../components/ui/PlaceCard';
import Pagination from '../components/ui/Pagination';
import GroupCard from '../components/ui/GroupCard';
import type { Place, Category, Group, Subcategory } from '../types';

type SearchResultType = 'category' | 'group' | 'subcategory' | 'place';

interface SearchResult {
  type: SearchResultType;
  name: string;
  link: string;
  subtitle?: string;
}

const categories: { key: Category | 'all'; label: string; route: string }[] = [
  { key: 'all', label: 'Todos', route: '/' },
  { key: 'turismo', label: 'Turismo', route: '/turismo' },
  { key: 'estabelecimento', label: 'Estabelecimentos', route: '/estabelecimentos' },
  { key: 'servico', label: 'Serviços', route: '/servicos' },
];

const CATEGORY_ROUTES: Record<Category, string> = {
  turismo: '/turismo',
  estabelecimento: '/estabelecimentos',
  servico: '/servicos',
};

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [placesSnapshot, groupsSnapshot, subcategoriesSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'places'), orderBy('name', 'asc'))),
          getDocs(query(collection(db, 'groups'), where('isActive', '==', true), orderBy('order', 'asc'))),
          getDocs(query(collection(db, 'subcategories'), orderBy('name', 'asc'))),
        ]);

        setPlaces(
          placesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Place[]
        );

        setGroups(
          groupsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as Group[]
        );

        setSubcategories(
          subcategoriesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Subcategory[]
        );
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const groupSubcategories = useMemo(() => {
    const subcats = new Set<string>();
    groups.forEach((group) => {
      group.subcategories.forEach((sub) => subcats.add(sub));
    });
    return subcats;
  }, [groups]);

  const placesInGroups = useMemo(() => {
    return places.filter((place) => 
      place.subcategories?.some((sub) => groupSubcategories.has(sub))
    );
  }, [places, groupSubcategories]);

  const searchResults = useMemo((): SearchResult[] => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const results: SearchResult[] = [];

    // Categorias (excluir "Todos")
    categories.forEach((cat) => {
      if (cat.key !== 'all' && cat.label.toLowerCase().includes(query)) {
        results.push({
          type: 'category',
          name: cat.label,
          link: cat.route,
          subtitle: 'Categoria',
        });
      }
    });

    // Subcategorias
    subcategories.forEach((sub) => {
      if (sub.name.toLowerCase().includes(query)) {
        const groupWithSub = groups.find(g => g.subcategories.includes(sub.name));
        
        let link: string;
        if (groupWithSub) {
          link = `/grupo/${groupWithSub.slug}`;
        } else {
          link = `${CATEGORY_ROUTES[sub.category]}?sub=${encodeURIComponent(sub.name)}`;
        }
        
        results.push({
          type: 'subcategory',
          name: sub.name,
          link,
          subtitle: groupWithSub ? 'Grupo' : 'Subcategoria',
        });
      }
    });

    // Grupos
    groups.forEach((group) => {
      if (group.name.toLowerCase().includes(query)) {
        results.push({
          type: 'group',
          name: group.name,
          link: `/grupo/${group.slug}`,
          subtitle: 'Grupo',
        });
      }
    });

    // Publicações (todas, incluindo as em grupos)
    places.forEach((place) => {
      if (place.name.toLowerCase().includes(query)) {
        results.push({
          type: 'place',
          name: place.name,
          link: `/${place.category}/${place.id}`,
          subtitle: categories.find((c) => c.key === place.category)?.label || place.category,
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, places, groups, subcategories]);

  const filteredPlaces = useMemo(() => {
    const hasSearch = searchQuery.trim() !== '';
    
    let filtered = places.filter((place) => {
      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
      if (!matchesCategory) return false;
      
      // Se não tem busca, ocultar publicações em grupos
      // Se tem busca, mostrar todas (incluindo as em grupos)
      if (!hasSearch && placesInGroups.includes(place)) {
        return false;
      }
      
      const matchesSearch =
        searchQuery === '' ||
        place.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

    if (selectedCategory === 'all') {
      filtered = [
        ...filtered.filter((p) => p.category !== 'turismo'),
        ...filtered.filter((p) => p.category === 'turismo'),
      ];
    }

    return filtered;
  }, [places, selectedCategory, searchQuery, placesInGroups]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => 
      selectedCategory === 'all' || group.category === selectedCategory
    );
  }, [groups, selectedCategory]);

  const groupPlaceCount = useMemo(() => {
    const countMap: Record<string, number> = {};
    filteredGroups.forEach((group) => {
      const count = places.filter((place) =>
        place.subcategories?.some((sub) => group.subcategories.includes(sub)) &&
        (selectedCategory === 'all' || place.category === selectedCategory)
      ).length;
      countMap[group.id] = count;
    });
    return countMap;
  }, [filteredGroups, places, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE));
  const paginatedPlaces = filteredPlaces.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <section className="bg-linear-to-br from-primary via-primary to-secondary py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Descubra o melhor de <span className="text-accent">Cruzeiro do Sul</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Encontre turismo, estabelecimentos e serviços em um só lugar
            </p>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-accent/50 bg-white"
                />
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
                    {searchResults.map((result, index) => (
                      <Link
                        key={index}
                        to={result.link}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {result.type === 'category' && (
                            <Tag className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                          {result.type === 'subcategory' && (
                            <Tag className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          )}
                          {result.type === 'group' && (
                            <Layers className="w-5 h-5 text-purple-500 flex-shrink-0" />
                          )}
                          {result.type === 'place' && (
                            <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-primary text-sm truncate">{result.name}</p>
                            <p className="text-xs text-gray-500">{result.subtitle}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {filteredGroups.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-primary mb-4">Explorar Categorias</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredGroups.map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    placeCount={groupPlaceCount[group.id] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-accent text-white shadow-lg shadow-accent/30'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <span className="ml-3 text-gray-500">Carregando publicações...</span>
            </div>
          ) : filteredPlaces.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {paginatedPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Nenhuma publicação encontrada.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}