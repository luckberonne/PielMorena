export interface Product {
  id: string;
  name: string;
  price?: number;
  description: string;
  featured: boolean;
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
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface FeedbackMessage {
  type: 'success' | 'error';
  message: string;
}