export type Category = 'turismo' | 'estabelecimento' | 'servico';

export interface Place {
  id: string;
  name: string;
  category: Category;
  subcategories?: string[];
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
