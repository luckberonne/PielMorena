import React, { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface BannerFormProps {
  onClose: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

export default function BannerForm({ onClose, showFeedback }: BannerFormProps) {
  const { settings, updateBanner } = useSiteSettings();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerText, setBannerText] = useState(settings?.banner_text || '');
  const [bannerLink, setBannerLink] = useState(settings?.banner_link || '');
  const [isEnabled, setIsEnabled] = useState(settings?.banner_enabled || false);
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
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await updateBanner({
        image: selectedImage,
        text: bannerText,
        link: bannerLink,
        enabled: isEnabled
      });
      showFeedback('success', 'Banner actualizado correctamente');
      onClose();
    } catch (err) {
      console.error('Error updating banner:', err);
      showFeedback('error', 'Error al actualizar el banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagen del Banner
        </label>
        {(settings?.banner_image || imagePreview) && (
          <div className="mb-4">
            <img
              src={imagePreview || settings?.banner_image}
              alt="Banner actual"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#2c2420] transition-colors duration-300">
          <div className="space-y-1 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="banner-image" className="relative cursor-pointer bg-white rounded-md font-medium text-[#2c2420] hover:text-[#3c3430] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#2c2420]">
                <span>Subir imagen</span>
                <input
                  id="banner-image"
                  type="file"
                  className="sr-only"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp"
                />
              </label>
              <p className="pl-1">o arrastra y suelta</p>
            </div>
            <p className="text-xs text-gray-500">
              JPG, PNG, WebP hasta 5MB
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texto del Banner
        </label>
        <input
          type="text"
          value={bannerText}
          onChange={(e) => setBannerText(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c2420] focus:ring focus:ring-[#2c2420] focus:ring-opacity-50"
          placeholder="Ej: ¡Oferta especial! 20% de descuento"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enlace del Banner (opcional)
        </label>
        <input
          type="text"
          value={bannerLink}
          onChange={(e) => setBannerLink(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c2420] focus:ring focus:ring-[#2c2420] focus:ring-opacity-50"
          placeholder="Ej: /collection"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="banner-enabled"
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          className="rounded border-gray-300 text-[#2c2420] focus:ring-[#2c2420]"
        />
        <label htmlFor="banner-enabled" className="ml-2 text-sm text-gray-700">
          Mostrar banner
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
            'Guardar Banner'
          )}
        </button>
      </div>
    </form>
  );
}