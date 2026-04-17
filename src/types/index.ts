export type Category = 'turismo' | 'estabelecimento' | 'servico';

export interface Place {
  id: string;
  name: string;
  category: Category;
  subcategories?: string[];
  groups?: string[];
  description: string;
  image: string;
  address?: string;
  phone?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category: Category;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  color: string;
  category: Category;
  subcategories: string[];
  order: number;
  isActive: boolean;
  createdAt: Date;
}
