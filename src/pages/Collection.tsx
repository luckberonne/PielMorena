import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product, PRODUCT_CATEGORIES } from '../types/product';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

export default function Collection() {
  const { products, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Get categories that have visible products
  const availableCategories = products
    ? Array.from(new Set(products.filter(p => p.visible).map(p => p.category).filter(Boolean)))
    : [];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrar productos basado en el término de búsqueda y categoría
  const filteredProducts = products?.filter(product => {
    if (!product.visible) return false;
    
    const matchesSearch = 
      
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
          
          {/* Search and Filter */}
          <div className="mt-8 max-w-3xl mx-auto space-y-4">
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
            
            {availableCategories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                    selectedCategory === '' 
                      ? 'bg-white text-[#2c2420]' 
                      : 'bg-transparent text-white border border-white hover:bg-white/10'
                  }`}
                >
                  Todos
                </button>
                {PRODUCT_CATEGORIES.filter(category => availableCategories.includes(category)).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                      selectedCategory === category 
                        ? 'bg-white text-[#2c2420]' 
                        : 'bg-transparent text-white border border-white hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
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
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => openModal(product)}
                />
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
        <ProductModal
          product={selectedProduct}
          currentImageIndex={currentImageIndex}
          onClose={closeModal}
          onPrevImage={(e) => {
            e.stopPropagation();
            if (selectedProduct) {
              setCurrentImageIndex((prevIndex) => 
                (prevIndex - 1 + selectedProduct.images.length) % selectedProduct.images.length
              );
            }
          }}
          onNextImage={(e) => {
            e.stopPropagation();
            if (selectedProduct) {
              setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % selectedProduct.images.length
              );
            }
          }}
          setCurrentImageIndex={setCurrentImageIndex}
        />
      )}
    </div>
  );
}