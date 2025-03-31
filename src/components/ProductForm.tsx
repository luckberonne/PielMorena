import React from 'react';
import { X, ImageIcon } from 'lucide-react';
import { CreateProductData } from '../types/product';

interface ProductFormProps {
  formData: CreateProductData;
  setFormData: (data: CreateProductData) => void;
  selectedImages: File[];
  setSelectedImages: (files: File[]) => void;
  imagePreviewUrls: string[];
  setImagePreviewUrls: (urls: string[]) => void;
  existingImages: { id: string; url: string }[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
  onDeleteImage: (imageId: string, imageUrl: string) => Promise<void>;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

export default function ProductForm({
  formData,
  setFormData,
  selectedImages,
  setSelectedImages,
  imagePreviewUrls,
  setImagePreviewUrls,
  existingImages,
  onSubmit,
  onClose,
  isSubmitting,
  isEditing,
  onDeleteImage,
  showFeedback
}: ProductFormProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = files.length + (existingImages?.length || 0);
    
    if (totalImages > 5) {
      showFeedback('error', 'Máximo 5 imágenes permitidas en total');
      return;
    }
    
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      showFeedback('error', 'Algunas imágenes no cumplen con los requisitos (máx 5MB, formatos: JPG, PNG, WebP)');
    }

    setSelectedImages(validFiles);
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      {isEditing && existingImages.length > 0 && (
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
                  onClick={() => onDeleteImage(image.id, image.url)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isEditing ? 'Agregar Nuevas Imágenes' : 'Imágenes'} 
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
              {isEditing ? 
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

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
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
            isEditing ? 'Guardar Cambios' : 'Crear Producto'
          )}
        </button>
      </div>
    </form>
  );
}