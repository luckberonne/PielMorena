export interface Product {
  id: string;
  name: string;
  price?: number;
  description: string;
  featured: boolean;
  category: string;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  order: number;
  created_at: string;
}

export interface CreateProductData {
  name: string;
  price?: number;
  description: string;
  featured: boolean;
  category: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface FeedbackMessage {
  type: 'success' | 'error';
  message: string;
}

export interface SiteSettings {
  id: string;
  hero_image: string;
  banner_image?: string;
  banner_text?: string;
  banner_enabled?: boolean;
  banner_link?: string;
  created_at?: string;
  updated_at?: string;
}

export const PRODUCT_CATEGORIES = [
  'Zapatos Formales',
  'Botas',
  'Mocasines',
  'Sandalias',
  'Zapatillas',
  'Otros'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];