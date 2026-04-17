import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PlaceCard from '../components/ui/PlaceCard';
import Pagination from '../components/ui/Pagination';
import type { Place, Group } from '../types';

const ITEMS_PER_PAGE = 15;

export default function GroupPage() {
  const { slug } = useParams<{ slug: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [slug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadData = async () => {
    if (!slug) return;

    setLoading(true);
    setNotFound(false);

    try {
      const groupsSnapshot = await getDocs(
        query(collection(db, 'groups'), where('slug', '==', slug))
      );

      if (groupsSnapshot.empty) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const groupData = {
        id: groupsSnapshot.docs[0].id,
        ...groupsSnapshot.docs[0].data(),
        createdAt: groupsSnapshot.docs[0].data().createdAt?.toDate() || new Date(),
      } as Group;

      setGroup(groupData);

      const placesSnapshot = await getDocs(
        query(collection(db, 'places'), where('subcategories', 'array-contains-any', groupData.subcategories))
      );

      const placesData = placesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Place[];

      setPlaces(placesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const shuffledPlaces = useMemo(() => {
    return [...places].sort(() => Math.random() - 0.5);
  }, [places]);

  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return shuffledPlaces;
    const query = searchQuery.toLowerCase();
    return shuffledPlaces.filter(
      (place) => place.name.toLowerCase().includes(query)
    );
  }, [shuffledPlaces, searchQuery]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return places
      .filter((place) => place.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [places, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE));
  const paginatedPlaces = filteredPlaces.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !group) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Grupo não encontrado</h1>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
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
        <div className="relative h-48 sm:h-64">
          <img
            src={group.image || 'https://via.placeholder.com/1200x400?text=Grupo'}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{group.icon}</span>
                <div>
                  <h1 className="text-3xl font-bold text-white">{group.name}</h1>
                  <p className="text-white/80">{places.length} estabelecimentos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar neste grupo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white shadow-sm"
              />
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
                  {searchResults.map((place) => (
                    <Link
                      key={place.id}
                      to={`/${place.category}/${place.id}`}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <p className="font-medium text-primary text-sm">{place.name}</p>
                      <p className="text-xs text-gray-500 truncate">{place.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filteredPlaces.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {paginatedPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
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
              <p className="text-gray-500 text-lg">Nenhum estabelecimento encontrado.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
