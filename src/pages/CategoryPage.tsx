import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Store, Wrench, Loader2, ArrowLeft } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PlaceCard from '../components/ui/PlaceCard';
import Pagination from '../components/ui/Pagination';
import SubcategoryChips from '../components/ui/SubcategoryChips';
import type { Place, Category, Subcategory } from '../types';

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
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const validCategory = ROUTE_MAP[category || ''] || 'turismo';

  const config = CATEGORY_CONFIG[validCategory];
  const CategoryIcon = config.icon;

  useEffect(() => {
    loadData();
  }, [validCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubcategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [placesSnapshot, subcategoriesSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'places'), where('category', '==', validCategory))),
        getDocs(query(collection(db, 'subcategories'), where('category', '==', validCategory), orderBy('name', 'asc'))),
      ]);

      const placesData = placesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Place[];

      const subcategoriesData = subcategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subcategory[];

      setAllPlaces(placesData);
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = useMemo(() => {
    if (selectedSubcategory === 'all') return allPlaces;
    return allPlaces.filter((place) => place.subcategory === selectedSubcategory);
  }, [allPlaces, selectedSubcategory]);

  const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);

  const paginatedPlaces = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPlaces.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPlaces, currentPage]);

  if (!validCategory) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header places={[]} />
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
      <Header places={allPlaces} />

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
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${config.bgColor} flex items-center justify-center`}>
                <CategoryIcon className={`w-8 h-8 ${config.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{config.title}</h1>
                <p className="text-white/80 mt-1">{config.description}</p>
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
                        onClick={() => {
                          alert(`Navegando para: /${place.category}/${place.id}`);
                        }}
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
