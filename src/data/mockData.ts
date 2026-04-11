import type { Place, Category } from '../types';

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Praça da Liberdade',
    category: 'turismo',
    description: 'Principal praça da cidade, com jardim bem cuidado, fonte luminosa e área de convivência para famílias.',
    image: 'https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=600&h=400&fit=crop',
    address: 'Centro, Cruzeiro do Sul - AC',
  },
  {
    id: '2',
    name: 'Ponte Metálica',
    category: 'turismo',
    description: 'Emblema histórico da cidade, ponte sobre o Rio Juruá que conecta os principais bairros.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop',
    address: 'Bairro Centro, Cruzeiro do Sul - AC',
  },
  {
    id: '3',
    name: 'Supermercado São Luiz',
    category: 'estabelecimento',
    description: 'Maior supermercado da região, com variedade em alimentos, bebidas, produtos de limpeza e higiene.',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=400&fit=crop',
    address: 'Av. Brasil, 1234 - Centro',
    phone: '(68) 3322-4567',
  },
  {
    id: '4',
    name: 'Academia Corpo em Forma',
    category: 'estabelecimento',
    description: 'Academia completa com equipamentos modernos, aulas de spinning, musculação e funcional.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    address: 'Rua das Palmeiras, 567 -Jd. América',
    phone: '(68) 3344-8901',
  },
  {
    id: '5',
    name: 'Clínica Odontológica Sorriso',
    category: 'servico',
    description: 'Especialistas em implantes, ortodontia e estética dental. Atendimento particular e convênios.',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop',
    address: 'Av. Getúlio Vargas, 890 - Centro',
    phone: '(68) 3355-2345',
  },
  {
    id: '6',
    name: 'Auto Elétrica São Paulo',
    category: 'servico',
    description: 'Serviço completo de elétrica automotiva, alternadores, motores de partida e instalação de som.',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=400&fit=crop',
    address: 'Rua São Paulo, 234 - Bairro Industrial',
    phone: '(68) 3366-7890',
  },
];

export const getCategoryLabel = (category: Category): string => {
  const labels: Record<Category, string> = {
    turismo: 'Turismo',
    estabelecimento: 'Estabelecimento',
    servico: 'Serviço',
  };
  return labels[category];
};

export const getCategoryColor = (category: Category): string => {
  const colors: Record<Category, string> = {
    turismo: 'bg-tertiary text-primary',
    estabelecimento: 'bg-accent text-white',
    servico: 'bg-secondary text-white',
  };
  return colors[category];
};
