import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Store, Loader2, ArrowLeft } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PlaceCard from '../components/ui/PlaceCard';
import type { Place, Category } from '../types';

const ROUTE_MAP: Record<string, Category> = {
  turismo: 'turismo',
  estabelecimentos: 'estabelecimento',
  servicos: 'servico',
};

const CATEGORY_CONFIG: Record<Category, { title: string; color: string }> = {
  turismo: {
    title: 'Turismo',
    color: 'bg-tertiary text-primary',
  },
  estabelecimento: {
    title: 'Estabelecimentos',
    color: 'bg-accent text-white',
  },
  servico: {
    title: 'Serviços',
    color: 'bg-secondary text-white',
  },
};

const CATEGORY_ROUTES: Record<Category, string> = {
  turismo: 'turismo',
  estabelecimento: 'estabelecimentos',
  servico: 'servicos',
};

export default function PlaceProfile() {
  const { category, id } = useParams<{ category: string; id: string }>();
  
  const [place, setPlace] = useState<Place | null>(null);
  const [relatedPlaces, setRelatedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const validCategory = ROUTE_MAP[category || ''];
  const categoryConfig = CATEGORY_CONFIG[validCategory || 'turismo'];
  const categoryRoute = CATEGORY_ROUTES[validCategory || 'turismo'];

  useEffect(() => {
    loadPlace();
  }, [id, validCategory]);

  const loadPlace = async () => {
    if (!id) return;
    
    setLoading(true);
    setNotFound(false);
    
    try {
      const placeRef = doc(db, 'places', id);
      const placeSnap = await getDoc(placeRef);

      if (!placeSnap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const placeData = { id: placeSnap.id, ...placeSnap.data() } as Place;
      setPlace(placeData);

      await loadRelatedPlaces(placeData);
    } catch (error) {
      console.error('Erro ao carregar publicação:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedPlaces = async (currentPlace: Place) => {
    if (!currentPlace.subcategories || currentPlace.subcategories.length === 0) return;

    try {
      const firstSubcategory = currentPlace.subcategories[0];
      const relatedQuery = query(
        collection(db, 'places'),
        where('category', '==', currentPlace.category),
        where('subcategories', 'array-contains', firstSubcategory),
        limit(4)
      );

      const snapshot = await getDocs(relatedQuery);
      const related = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Place))
        .filter((p) => p.id !== currentPlace.id)
        .slice(0, 3);

      setRelatedPlaces(related);
    } catch (error) {
      console.error('Erro ao carregar publicações relacionadas:', error);
    }
  };

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

  if (notFound || !place) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Publicação não encontrada
            </h1>
            <p className="text-gray-500 mb-6">
              Esta publicação pode ter sido removida ou não existe.
            </p>
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
        <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] max-h-[80vh] overflow-hidden bg-black">
          {place.image && (
            <img
              src={place.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110"
              aria-hidden="true"
            />
          )}
          <img
            src={place.image || 'https://via.placeholder.com/1200x600?text=Sem+imagem'}
            alt={place.name}
            className="relative w-full h-full max-h-[80vh] object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 mt-0 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <Link
              to={`/${categoryRoute}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para {categoryConfig.title}
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${categoryConfig.color}`}>
                {categoryConfig.title}
              </span>
              {place.subcategories && place.subcategories.map((sub) => (
                <span key={sub} className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
                  {sub}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6">
              {place.name}
            </h1>

            <div className="prose prose-gray max-w-none mb-8">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {place.description}
              </p>
            </div>

            <div className="border-t pt-6 space-y-4">
              {place.address && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Endereço</p>
                    <p className="text-gray-900">{place.address}</p>
                  </div>
                </div>
              )}

              {place.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Telefone</p>
                    <p className="text-gray-900">{place.phone}</p>
                  </div>
                </div>
              )}

              {!place.address && !place.phone && (
                <div className="text-center py-4 text-gray-500">
                  <p>Informações de contato não disponíveis</p>
                </div>
              )}
            </div>
          </div>

          {relatedPlaces.length > 0 && (
            <div className="mt-12 mb-8">
              <h2 className="text-xl font-bold text-primary mb-6">Veja também</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPlaces.map((relatedPlace) => (
                  <PlaceCard
                    key={relatedPlace.id}
                    place={relatedPlace}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
