import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product } from '../types/product';

export default function Collection() {
  const { products, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProduct) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % selectedProduct.images.length
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProduct) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex - 1 + selectedProduct.images.length) % selectedProduct.images.length
      );
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
  };

  const loadMore = () => {
    setVisibleProducts(prev => Math.min(prev + 8, filteredProducts?.length || 0));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-xl text-red-600 bg-red-100 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-[#f8f5f2] min-h-screen">
      {/* Collection Header */}
      <div className="bg-[#2c2420] text-white py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold text-center">Nuestra Colección</h2>
          <p className="mt-4 text-lg text-center max-w-2xl mx-auto">
            Cada par de zapatos es una obra maestra artesanal, creada con los mejores cueros y técnicas tradicionales.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3c3430]"
              />
              <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProducts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts?.slice(0, visibleProducts).map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => openModal(product)}
                >
                  <div className="aspect-w-1 aspect-h-1 overflow-hidden">
                    <img
                      src={product.images[0]?.image_url}
                      alt={product.name}
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                    {product.featured && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                        Destacado
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-serif font-medium text-gray-900">{product.name}</h3>
                    {product.price && (
                      <p className="text-[#2c2420] font-medium mt-1">
                        ${product.price.toFixed(2)}
                      </p>
                    )}
                    <p className="text-gray-600 mt-2 text-sm line-clamp-2">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredProducts && visibleProducts < filteredProducts.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  className="bg-[#2c2420] text-white px-8 py-3 rounded-md hover:bg-[#3c3430] transition-colors duration-300"
                >
                  Cargar Más Productos
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300"
            >
              <X size={24} className="text-gray-700" />
            </button>
            
            <div className="p-6">
              <div className="relative">
                <img
                  src={selectedProduct.images[currentImageIndex]?.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-[500px] object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg';
                  }}
                />
                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {selectedProduct.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {selectedProduct.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-none w-24 h-24 rounded-md overflow-hidden ${
                        currentImageIndex === index ? 'ring-2 ring-[#2c2420]' : ''
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${selectedProduct.name} - Vista ${index + 1}`}
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

              <div className="mt-8">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-serif font-bold text-gray-900">
                    {selectedProduct.name}
                  </h2>
                  {selectedProduct.featured && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                      Destacado
                    </span>
                  )}
                </div>
                {selectedProduct.price && (
                  <p className="text-2xl text-[#2c2420] font-medium mt-2">
                    ${selectedProduct.price.toFixed(2)}
                  </p>
                )}
                <p className="text-gray-600 mt-4 leading-relaxed">{selectedProduct.description}</p>
                <div className="mt-8 flex gap-4">
                  <a
                    href={`https://wa.me/1234567890?text=Hola, me interesa el producto: ${selectedProduct.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] text-white px-8 py-4 rounded-md hover:bg-[#128C7E] transition-colors duration-300 font-medium text-lg text-center"
                  >
                    Contactar por WhatsApp
                  </a>
                  <a
                    href={`mailto:info@cuero.com?subject=Consulta sobre ${selectedProduct.name}`}
                    className="flex-1 bg-[#2c2420] text-white px-8 py-4 rounded-md hover:bg-[#3c3430] transition-colors duration-300 font-medium text-lg text-center"
                  >
                    Solicitar Información
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}