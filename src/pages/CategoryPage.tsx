import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { MapPin, Store, Wrench, Loader2, ArrowLeft, Search, Tag, Layers } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PlaceCard from '../components/ui/PlaceCard';
import Pagination from '../components/ui/Pagination';
import SubcategoryChips from '../components/ui/SubcategoryChips';
import GroupCard from '../components/ui/GroupCard';
import type { Place, Category, Subcategory, Group } from '../types';

type SearchResultType = 'category' | 'group' | 'subcategory' | 'place';

interface SearchResult {
  type: SearchResultType;
  name: string;
  link: string;
  subtitle?: string;
}

const ITEMS_PER_PAGE = 6;

const ROUTE_MAP: Record<string, Category> = {
  turismo: 'turismo',
  estabelecimentos: 'estabelecimento',
  servicos: 'servico',
};

const CATEGORY_CONFIG: Record<Category, { title: string; description: string; icon: typeof MapPin; color: string; bgColor: string }> = {
  turismo: {
    title: 'Turismo',
    description: 'Explore os pontos turísticos de Cruzeiro do Sul',
    icon: MapPin,
    color: 'text-tertiary',
    bgColor: 'bg-tertiary/10',
  },
  estabelecimento: {
    title: 'Estabelecimentos',
    description: 'Encontre os melhores estabelecimentos da cidade',
    icon: Store,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  servico: {
    title: 'Serviços',
    description: 'Descubra prestadores de serviços locais',
    icon: Wrench,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const validCategory = ROUTE_MAP[category || ''] || 'turismo';

  const config = CATEGORY_CONFIG[validCategory];
  const CategoryIcon = config.icon;

  useEffect(() => {
    const subParam = searchParams.get('sub');
    if (subParam && subcategories.length > 0) {
      const found = subcategories.find(s => s.name.toLowerCase() === subParam.toLowerCase());
      if (found) {
        setSelectedSubcategory(found.name);
      }
    }
  }, [searchParams, subcategories]);

  useEffect(() => {
    loadData();
  }, [validCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubcategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [placesSnapshot, subcategoriesSnapshot, groupsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'places'), where('category', '==', validCategory))),
        getDocs(query(collection(db, 'subcategories'), where('category', '==', validCategory), orderBy('name', 'asc'))),
        getDocs(query(collection(db, 'groups'), where('isActive', '==', true), orderBy('order', 'asc'))),
      ]);

      const placesData = placesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Place[];

      const subcategoriesData = subcategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subcategory[];

      const groupsRaw = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

      const groupsData = (groupsRaw as Group[]).filter(
        (g) => (g.category || 'estabelecimento') === validCategory
      );

      setAllPlaces(placesData);
      setSubcategories(subcategoriesData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = useMemo(() => {
    const groupSubcategories = new Set<string>();
    groups.forEach((group) => {
      group.subcategories.forEach((sub) => groupSubcategories.add(sub));
    });

    const placesInGroups = allPlaces.filter((place) =>
      place.subcategories?.some((sub) => groupSubcategories.has(sub))
    );

    const hasSearch = searchQuery.trim() !== '';

    let filtered = allPlaces.filter((place) => {
      if (selectedSubcategory !== 'all' && selectedSubcategory !== '') {
        return place.subcategories?.includes(selectedSubcategory) ?? false;
      }
      if (!hasSearch && placesInGroups.includes(place)) {
        return false;
      }
      return true;
    });

    return filtered;
  }, [allPlaces, selectedSubcategory, groups, searchQuery]);

  const groupPlaceCount = useMemo(() => {
    const countMap: Record<string, number> = {};
    groups.forEach((group) => {
      const count = allPlaces.filter((place) =>
        place.subcategories?.some((sub) => group.subcategories.includes(sub))
      ).length;
      countMap[group.id] = count;
    });
    return countMap;
  }, [groups, allPlaces]);

  const searchResults = useMemo((): SearchResult[] => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const results: SearchResult[] = [];

    // Categoria atual
    const currentCategory = CATEGORY_CONFIG[validCategory];
    if (currentCategory.title.toLowerCase().includes(query)) {
      results.push({
        type: 'category',
        name: currentCategory.title,
        link: `/${category}`,
        subtitle: 'Categoria',
      });
    }

    // Subcategorias da categoria
    subcategories.forEach((sub) => {
      if (sub.name.toLowerCase().includes(query)) {
        const groupWithSub = groups.find(g => g.subcategories.includes(sub.name));
        
        let link: string;
        if (groupWithSub) {
          link = `/grupo/${groupWithSub.slug}`;
        } else {
          link = `/${category}`;
        }
        
        results.push({
          type: 'subcategory',
          name: sub.name,
          link,
          subtitle: groupWithSub ? 'Grupo' : 'Subcategoria',
        });
      }
    });

    // Grupos da categoria
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

    // Publicações da categoria (todas, incluindo em grupos)
    allPlaces.forEach((place) => {
      if (place.name.toLowerCase().includes(query)) {
        results.push({
          type: 'place',
          name: place.name,
          link: `/${place.category}/${place.id}`,
          subtitle: CATEGORY_CONFIG[place.category]?.title || place.category,
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, groups, allPlaces, subcategories, validCategory, category]);

  const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);

  const paginatedPlaces = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPlaces.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPlaces, currentPage]);

  if (!validCategory) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoria não encontrada</h1>
            <Link to="/" className="text-accent hover:underline">
              Voltar para home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary via-primary to-secondary py-12">
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl ${config.bgColor} flex items-center justify-center`}>
                <CategoryIcon className={`w-8 h-8 ${config.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{config.title}</h1>
                <p className="text-white/80 mt-1">{config.description}</p>
              </div>
            </div>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar em ${config.title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white shadow-sm"
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : (
            <>
              {groups.length > 0 && selectedSubcategory === 'all' && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-primary mb-4">Explorar Categorias</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {groups.map((group) => (
                      <GroupCard 
                        key={group.id} 
                        group={group} 
                        placeCount={groupPlaceCount[group.id] || 0}
                      />
                    ))}
                  </div>
                </div>
              )}

              <SubcategoryChips
                subcategories={subcategories}
                selected={selectedSubcategory}
                onSelect={setSelectedSubcategory}
              />

              {filteredPlaces.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <CategoryIcon className={`w-10 h-10 ${config.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-gray-500">
                    {selectedSubcategory !== 'all'
                      ? 'Tente selecionar outra subcategoria ou ver todos.'
                      : 'Em breve teremos publicações nesta categoria.'}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
