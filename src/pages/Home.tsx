import { useState, useMemo, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PlaceCard from '../components/ui/PlaceCard';
import type { Place, Category } from '../types';

const categories: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'turismo', label: 'Turismo' },
  { key: 'estabelecimento', label: 'Estabelecimentos' },
  { key: 'servico', label: 'Serviços' },
];

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const placesRef = collection(db, 'places');
        const q = query(placesRef, orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Place[];
        setPlaces(data);
      } catch (error) {
        console.error('Erro ao carregar publicações:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlaces();
  }, []);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [places, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header places={places} />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary via-primary to-secondary py-16 sm:py-24">
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
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                />
              ))}
            </div>
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
