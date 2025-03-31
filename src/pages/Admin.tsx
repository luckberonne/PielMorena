import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Pencil, Trash2, Plus, X, Star, StarOff, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { CreateProductData, Product } from '../types/product';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import LoginForm from '../components/LoginForm';

export default function Admin() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    price: undefined,
    description: '',
    featured: false
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = files.length + (existingImages?.length || 0);
    
    if (totalImages > 5) {
      showFeedback('error', 'Máximo 5 imágenes permitidas en total');
      return;
    }
    
    // Validar tamaño y tipo de archivos
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      showFeedback('error', 'Algunas imágenes no cumplen con los requisitos (máx 5MB, formatos: JPG, PNG, WebP)');
    }

    setSelectedImages(validFiles);
    
    // Create preview URLs
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedProduct) {
        // Primero actualizamos la información básica del producto
        await updateProduct({
          id: selectedProduct.id,
          ...formData
        });

        // Si hay nuevas imágenes, las procesamos
        if (selectedImages.length > 0) {
          // Subir nuevas imágenes
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

            // Insertar registro de imagen
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
    } catch (err) {
      console.error('Error saving product:', err);
      showFeedback('error', 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extraer el nombre del archivo de la URL
      const fileName = imageUrl.split('/').pop();
      const productId = selectedProduct?.id;

      if (!productId || !fileName) {
        throw new Error('No se pudo identificar la imagen');
      }

      // Eliminar el archivo del storage
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([`${productId}/${fileName}`]);

      if (storageError) throw storageError;

      // Eliminar el registro de la base de datos
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Actualizar el estado local
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
        featured: product.featured
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
        featured: false
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
      featured: false
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
          <AlertCircle className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-[#f8f5f2]">
      {/* Feedback Message */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">Administración de Productos</h1>
          <button
            onClick={() => openModal()}
            className="bg-[#2c2420] text-white px-4 py-2 rounded-md hover:bg-[#3c3430] transition-colors duration-300 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Nuevo Producto
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destacado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.images[0]?.image_url || '/placeholder.jpg'}
                          alt={product.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.price ? `$${product.price.toFixed(2)}` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFeatured(product)}
                      className={`text-gray-600 hover:text-yellow-500 transition-colors duration-300 ${
                        product.featured ? 'text-yellow-500' : ''
                      }`}
                    >
                      {product.featured ? <Star size={20} /> : <StarOff size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openModal(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-300"
                      title="Editar"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-300"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold">
                {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c2420] focus:ring focus:ring-[#2c2420] focus:ring-opacity-50"
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c2420] focus:ring focus:ring-[#2c2420] focus:ring-opacity-50"
                      step="0.01"
                      min="0"
                      max="99999.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c2420] focus:ring focus:ring-[#2c2420] focus:ring-opacity-50"
                    rows={4}
                    required
                    minLength={10}
                    maxLength={500}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length}/500 caracteres
                  </p>
                </div>

                {/* Existing Images Section */}
                {selectedProduct && existingImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imágenes Actuales
                    </label>
                    <div className="grid grid-cols-5 gap-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url}
                            alt="Product"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => deleteImage(image.id, image.url)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedProduct ? 'Agregar Nuevas Imágenes' : 'Imágenes'} 
                    (máx. 5 imágenes en total, 5MB c/u, formatos: JPG, PNG, WebP)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#2c2420] transition-colors duration-300">
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#2c2420] hover:text-[#3c3430] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#2c2420]">
                          <span>Subir imágenes</span>
                          <input
                            id="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleImageChange}
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {selectedProduct ? 
                          `Puedes agregar hasta ${5 - existingImages.length} imágenes más` :
                          'Selecciona hasta 5 imágenes'}
                      </p>
                    </div>
                  </div>

                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-5 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
                              setSelectedImages(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300 text-[#2c2420] focus:ring-[#2c2420]"
                    id="featured"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                    Destacar producto
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c2420] text-white rounded-md hover:bg-[#3c3430] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    selectedProduct ? 'Guardar Cambios' : 'Crear Producto'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}