import React, { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeroImageFormProps {
  onClose: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

export default function HeroImageForm({ onClose, showFeedback }: HeroImageFormProps) {
  const { settings, updateHeroImage } = useSiteSettings();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

    if (!isValidType || !isValidSize) {
      showFeedback('error', 'La imagen debe ser JPG, PNG o WebP y no exceder 5MB');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await updateHeroImage(selectedImage);
      showFeedback('success', 'Imagen de portada actualizada correctamente');
      onClose();
    } catch (err) {
      console.error('Error updating hero image:', err);
      showFeedback('error', 'Error al actualizar la imagen de portada');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagen Actual
        </label>
        <img
          src={settings?.hero_image}
          alt="Hero actual"
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nueva Imagen (máx. 5MB, formatos: JPG, PNG, WebP)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#2c2420] transition-colors duration-300">
          <div className="space-y-1 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="hero-image" className="relative cursor-pointer bg-white rounded-md font-medium text-[#2c2420] hover:text-[#3c3430] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#2c2420]">
                <span>Subir imagen</span>
                <input
                  id="hero-image"
                  type="file"
                  className="sr-only"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp"
                />
              </label>
              <p className="pl-1">o arrastra y suelta</p>
            </div>
          </div>
        </div>

        {imagePreview && (
          <div className="mt-4 relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}
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
          disabled={!selectedImage || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            'Actualizar Imagen'
          )}
        </button>
      </div>
    </form>
  );
}