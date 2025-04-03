import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product } from '../types/product';
import FeaturedCarousel from '../components/FeaturedCarousel';
import HeroSection from '../components/HeroSection';
import ProductModal from '../components/ProductModal';

export default function Home() {
  const { featuredProducts, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Ajuste para el header fijo
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Check if there's a hash in the URL when component mounts
    const hash = window.location.hash.slice(1); // Remove the # symbol
    if (hash) {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    }
  }, []);

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
    <div>
      <HeroSection onScrollToSection={scrollToSection} />

      {featuredProducts && featuredProducts.length > 0 && (
        <FeaturedCarousel 
          products={featuredProducts} 
          onProductClick={openModal} 
        />
      )}

      {/* About Section */}
      <section id="about" className="bg-[#2c2420] text-white py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-6">Sobre Nosotros</h2>
              <p className="text-lg font-sans mb-6">
                Con más de 30 años de experiencia en la fabricación de calzado de cuero, 
                nos enorgullece ofrecer productos de la más alta calidad, combinando técnicas 
                artesanales tradicionales con diseños contemporáneos.
              </p>
              <p className="text-lg font-sans">
                Cada par de zapatos es creado con pasión y dedicación, utilizando los mejores 
                materiales y prestando atención a cada detalle para garantizar no solo belleza, 
                sino también durabilidad y comodidad.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1585139786570-355c88231b55?auto=format&fit=crop&q=80&w=2000"
                alt="Artesano trabajando el cuero"
                className="rounded-lg shadow-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 scroll-mt-16 bg-[#f8f5f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-[#2c2420]" />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">Teléfono</h3>
              <p className="text-center text-gray-600">+34 900 123 456</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-[#2c2420]" />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">Email</h3>
              <p className="text-center text-gray-600">info@cuero.com</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-[#2c2420]" />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">Dirección</h3>
              <p className="text-center text-gray-600">Calle Principal 123, Madrid</p>
            </div>
          </div>
        </div>
      </section>

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