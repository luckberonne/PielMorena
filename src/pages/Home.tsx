import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product } from '../types/product';

export default function Home() {
  const { featuredProducts, loading, error } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Auto-advance carousel
  useEffect(() => {
    if (!featuredProducts?.length || featuredProducts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts]);

  const nextSlide = () => {
    if (!featuredProducts?.length) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (!featuredProducts?.length) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredProducts.length - 1 : prevIndex - 1
    );
  };

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
      {/* Hero Section */}
      <div className="relative pt-16">
        <div className="absolute inset-0">
          <img
            className="w-full h-[600px] object-cover"
            src="https://images.unsplash.com/photo-1614252240798-17e859b3e353?auto=format&fit=crop&q=80&w=2000"
            alt="Zapato de cuero premium"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&q=80&w=2000';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Artesanía en Cuero
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-gray-100 font-sans">
            Descubre nuestra colección de zapatos artesanales, donde cada pieza es una obra maestra de calidad y estilo.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/collection"
              className="inline-block bg-white text-gray-900 px-8 py-3 text-lg font-medium rounded-md hover:bg-gray-100 transition-colors duration-300"
            >
              Ver Colección
            </Link>
            <button
              onClick={() => scrollToSection('contact')}
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 text-lg font-medium rounded-md hover:bg-white/10 transition-colors duration-300"
            >
              Contáctanos
            </button>
          </div>
        </div>
      </div>

      {/* Featured Products Carousel */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
            Productos Destacados
          </h2>
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {featuredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="w-full flex-shr
ink-0 px-4"
                    onClick={() => openModal(product)}
                  >
                    <div className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="aspect-w-3 aspect-h-2 overflow-hidden">
                        <img
                          src={product.images[0]?.image_url}
                          alt={product.name}
                          className="w-full h-[400px] object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-serif font-medium text-gray-900">{product.name}</h3>
                        {product.price && (
                          <p className="text-lg text-[#2c2420] font-medium mt-2">${product.price.toFixed(2)}</p>
                        )}
                        <p className="mt-2 text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {featuredProducts.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-300 -ml-4 z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-300 -mr-4 z-10"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        currentIndex === index ? 'bg-[#2c2420]' : 'bg-gray-300'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/collection"
              className="inline-block bg-[#2c2420] text-white px-8 py-3 rounded-md hover:bg-[#3c3430] transition-colors duration-300"
            >
              Ver Toda la Colección
            </Link>
          </div>
        </section>
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