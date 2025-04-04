import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, CreateProductData, UpdateProductData } from '../types/product';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const products = productsData as Product[];
      setProducts(products);
      setFeaturedProducts(products.filter(p => p.featured && p.visible));
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error al cargar los productos. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: CreateProductData, images: File[]) => {
    try {
      // Validaciones
      if (!productData.name.trim()) throw new Error('El nombre es requerido');
      if (!productData.description.trim()) throw new Error('La descripción es requerida');
      if (images.length === 0) throw new Error('Se requiere al menos una imagen');
      if (images.length > 5) throw new Error('Máximo 5 imágenes permitidas');

      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({ ...productData, visible: true })
        .select()
        .single();

      if (productError) throw productError;

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        // Insert image record
        const { error: imageError } = await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            image_url: publicUrl,
            order: i
          });

        if (imageError) throw imageError;
      }

      await loadProducts();
      return product;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  const updateProduct = async (productData: UpdateProductData) => {
    try {
      // Validaciones
      if (productData.name && !productData.name.trim()) throw new Error('El nombre es requerido');
      if (productData.description && !productData.description.trim()) throw new Error('La descripción es requerida');

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productData.id);

      if (error) throw error;
      await loadProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      // Primero eliminamos las imágenes del storage
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);

      if (images) {
        for (const image of images) {
          const path = image.image_url.split('/').pop();
          await supabase.storage
            .from('product-images')
            .remove([`${productId}/${path}`]);
        }
      }

      // Luego eliminamos el producto (las imágenes en la base de datos se eliminarán automáticamente por la restricción ON DELETE CASCADE)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    featuredProducts,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh: loadProducts
  };
}