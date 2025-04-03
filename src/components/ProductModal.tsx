import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Product } from '../types/product';

interface ProductModalProps {
  product: Product;
  currentImageIndex: number;
  onClose: () => void;
  onPrevImage: (e: React.MouseEvent) => void;
  onNextImage: (e: React.MouseEvent) => void;
  setCurrentImageIndex: (index: number) => void;
}

export default function ProductModal({
  product,
  currentImageIndex,
  onClose,
  onPrevImage,
  onNextImage,
  setCurrentImageIndex
}: ProductModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300"
        >
          <X size={24} className="text-gray-700" />
        </button>
        
        <div className="p-4 sm:p-6">
          <div className="relative">
            <div className="relative pb-[75%] sm:pb-[65%]">
              <img
                src={product.images[currentImageIndex]?.image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.jpg';
                }}
              />
            </div>
            {product.images.length > 1 && (
              <>
                <button
                  onClick={onPrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={onNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-none w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden ${
                    currentImageIndex === index ? 'ring-2 ring-[#2c2420]' : ''
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${product.name} - Vista ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 sm:mt-8">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                {product.name}
              </h2>
              {product.featured && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                  Destacado
                </span>
              )}
            </div>
            {product.price && (
              <p className="text-xl sm:text-2xl text-[#2c2420] font-medium mt-2">
                ${product.price.toFixed(2)}
              </p>
            )}
            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/1234567890?text=Hola, me interesa el producto: ${product.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white px-6 py-3 rounded-md hover:bg-[#128C7E] transition-colors duration-300 font-medium text-center"
              >
                Contactar por WhatsApp
              </a>
              <a
                href={`mailto:info@cuero.com?subject=Consulta sobre ${product.name}`}
                className="flex-1 bg-[#2c2420] text-white px-6 py-3 rounded-md hover:bg-[#3c3430] transition-colors duration-300 font-medium text-center"
              >
                Solicitar Información
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}