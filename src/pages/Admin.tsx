import React, { useState, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { CreateProductData, Product } from '../types/product';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import LoginForm from '../components/LoginForm';
import ProductsTable from '../components/ProductsTable';
import ProductForm from '../components/ProductForm';
import FeedbackMessage from '../components/FeedbackMessage';
import HeroImageForm from '../components/HeroImageForm';
import BulkUploadForm from '../components/BulkUploadForm';
import BannerForm from '../components/BannerForm';

export default function Admin() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, refresh } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    price: undefined,
    description: '',
    featured: false,
    category: ''
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
    }
    setIsAuthenticating(false);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setIsAuthenticated(true);
      setAuthError(null);
      showFeedback('success', 'Sesión iniciada correctamente');
    } catch (err) {
      console.error('Error signing in:', err);
      setAuthError('Credenciales inválidas. Por favor, intenta de nuevo.');
      throw err;
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedProduct) {
        await updateProduct({
          id: selectedProduct.id,
          ...formData
        });

        if (selectedImages.length > 0) {
          for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${selectedProduct.id}/${Date.now()}-${i}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);

            const { error: imageError } = await supabase
              .from('product_images')
              .insert({
                product_id: selectedProduct.id,
                image_url: publicUrl,
                order: existingImages.length + i
              });

            if (imageError) throw imageError;
          }
        }

        showFeedback('success', 'Producto actualizado correctamente');
      } else {
        if (!selectedImages.length) {
          showFeedback('error', 'Debes seleccionar al menos una imagen');
          return;
        }
        await createProduct(formData, selectedImages);
        showFeedback('success', 'Producto creado correctamente');
      }
      closeModal();
      refresh();
    } catch (err) {
      console.error('Error saving product:', err);
      showFeedback('error', 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop();
      const productId = selectedProduct?.id;

      if (!productId || !fileName) {
        throw new Error('No se pudo identificar la imagen');
      }

      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([`${productId}/${fileName}`]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      showFeedback('success', 'Imagen eliminada correctamente');
    } catch (err) {
      console.error('Error deleting image:', err);
      showFeedback('error', 'Error al eliminar la imagen');
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        price: product.price || undefined,
        description: product.description,
        featured: product.featured,
        category: product.category
      });
      setExistingImages(
        product.images.map(img => ({
          id: img.id,
          url: img.image_url
        }))
      );
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        price: undefined,
        description: '',
        featured: false,
        category: ''
      });
      setExistingImages([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      price: undefined,
      description: '',
      featured: false,
      category: ''
    });
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setExistingImages([]);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteProduct(productId);
        showFeedback('success', 'Producto eliminado correctamente');
      } catch (err) {
        console.error('Error deleting product:', err);
        showFeedback('error', 'Error al eliminar el producto');
      }
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      await updateProduct({
        id: product.id,
        featured: !product.featured
      });
      showFeedback('success', `Producto ${!product.featured ? 'destacado' : 'no destacado'} correctamente`);
    } catch (err) {
      console.error('Error updating featured status:', err);
      showFeedback('error', 'Error al actualizar el estado destacado');
    }
  };

  if (isAuthenticating) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 bg-[#f8f5f2] flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-[#f8f5f2]">
      {feedback && <FeedbackMessage feedback={feedback} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">Administración de Productos</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsHeroModalOpen(true)}
              className="bg-[#2c2420] text-white px-4 py-2 rounded-md hover:bg-[#3c3430] transition-colors duration-300"
            >
              Editar Imagen Principal
            </button>
            <button
              onClick={() => setIsBannerModalOpen(true)}
              className="bg-[#2c2420] text-white px-4 py-2 rounded-md hover:bg-[#3c3430] transition-colors duration-300"
            >
              Editar Banner
            </button>
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="bg-[#2c2420] text-white px-4 py-2 rounded-md hover:bg-[#3c3430] transition-colors duration-300 flex items-center"
            >
              <Upload size={20} className="mr-2" />
              Carga Masiva
            </button>
            <button
              onClick={() => openModal()}
              className="bg-[#2c2420] text-white px-4 py-2 rounded-md hover:bg-[#3c3430] transition-colors duration-300 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Nuevo Producto
            </button>
          </div>
        </div>

        <ProductsTable
          products={products}
          onEdit={openModal}
          onDelete={handleDelete}
          onToggleFeatured={toggleFeatured}
        />
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <ProductForm
              formData={formData}
              setFormData={setFormData}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              imagePreviewUrls={imagePreviewUrls}
              setImagePreviewUrls={setImagePreviewUrls}
              existingImages={existingImages}
              onSubmit={handleSubmit}
              onClose={closeModal}
              isSubmitting={isSubmitting}
              isEditing={!!selectedProduct}
              onDeleteImage={deleteImage}
              showFeedback={showFeedback}
            />
          </div>
        </div>
      )}

      {/* Hero Image Modal */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <HeroImageForm
              onClose={() => setIsHeroModalOpen(false)}
              showFeedback={showFeedback}
            />
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <BannerForm
              onClose={() => setIsBannerModalOpen(false)}
              showFeedback={showFeedback}
            />
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <BulkUploadForm
              onClose={() => {
                setIsBulkUploadOpen(false);
                refresh();
              }}
              showFeedback={showFeedback}
            />
          </div>
        </div>
      )}
    </div>
  );
}