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
  const [slidesToShow, setSlidesToShow] = useState(1);
  const navigate = useNavigate();

  // Determine number of slides to show based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setSlidesToShow(3);
      } else if (window.innerWidth >= 768) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(1);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!featuredProducts?.length || featuredProducts.length <= slidesToShow) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = featuredProducts.length - slidesToShow;
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts, slidesToShow]);

  const nextSlide = () => {
    if (!featuredProducts?.length) return;
    
    const maxIndex = featuredProducts.length - slidesToShow;
    setCurrentIndex((prevIndex) => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (!featuredProducts?.length) return;
    
    const maxIndex = featuredProducts.length - slidesToShow;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? maxIndex : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    // Make sure we don't go beyond max possible index
    const maxIndex = featuredProducts ? Math.max(0, featuredProducts.length - slidesToShow) : 0;
    setCurrentIndex(Math.min(index, maxIndex));
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

  // Calculate the percentage width for each slide
  const slideWidth = slidesToShow > 0 ? 100 / slidesToShow : 100;

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
            className="w-full h-64 md:h-96 lg:h-[600px] object-cover"
            src="https://images.unsplash.com/photo-1614252240798-17e859b3e353?auto=format&fit=crop&q=80&w=2000"
            alt="Zapato de cuero premium"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&q=80&w=2000';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Artesanía en Cuero
          </h1>
          <p className="mt-4 md:mt-6 max-w-3xl text-lg md:text-xl text-gray-100 font-sans">
            Descubre nuestra colección de zapatos artesanales, donde cada pieza es una obra maestra de calidad y estilo.
          </p>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/collection"
              className="w-full sm:w-auto inline-block bg-white text-gray-900 px-6 md:px-8 py-3 text-center text-lg font-medium rounded-md hover:bg-gray-100 transition-colors duration-300"
            >
              Ver Colección
            </Link>
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto inline-block bg-transparent border-2 border-white text-white px-6 md:px-8 py-3 text-center text-lg font-medium rounded-md hover:bg-white/10 transition-colors duration-300"
            >
              Contáctanos
            </button>
          </div>
        </div>
      </div>

      {/* Featured Products Carousel */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8 md:mb-12 text-center">
            Productos Destacados
          </h2>
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * slideWidth}%)` }}
              >
                {featuredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="flex-none px-2 md:px-4"
                    style={{ width: `${slideWidth}%` }}
                    onClick={() => openModal(product)}
                  >
                    <div className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.images[0]?.image_url}
                          alt={product.name}
                          className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-serif font-medium text-gray-900">{product.name}</h3>
                        {product.price && (
                          <p className="text-md md:text-lg text-[#2c2420] font-medium mt-2">${product.price.toFixed(2)}</p>
                        )}
                        <p className="mt-2 text-sm md:text-base text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {featuredProducts.length > slidesToShow && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 md:p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-300 -ml-3 md:-ml-4 z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={20} className="md:w-6 md:h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 md:p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-300 -mr-3 md:-mr-4 z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight size={20} className="md:w-6 md:h-6" />
                </button>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {Array.from({ length: featuredProducts.length - slidesToShow + 1 }).map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index <= currentIndex && currentIndex <= index + slidesToShow - 1 ? 'bg-[#2c2420]' : 'bg-gray-300'
                      }`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/collection"
              className="inline-block bg-[#2c2420] text-white px-6 md:px-8 py-3 rounded-md hover:bg-[#3c3430] transition-colors duration-300"
            >
              Ver Toda la Colección
            </Link>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="bg-[#2c2420] text-white py-16 md:py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 md:mb-6">Sobre Nosotros</h2>
              <p className="text-base md:text-lg font-sans mb-4 md:mb-6">
                Con más de 30 años de experiencia en la fabricación de calzado de cuero, 
                nos enorgullece ofrecer productos de la más alta calidad, combinando técnicas 
                artesanales tradicionales con diseños contemporáneos.
              </p>
              <p className="text-base md:text-lg font-sans">
                Cada par de zapatos es creado con pasión y dedicación, utilizando los mejores 
                materiales y prestando atención a cada detalle para garantizar no solo belleza, 
                sino también durabilidad y comodidad.
              </p>
            </div>
            <div className="relative mt-6 md:mt-0">
              <img
                src="https://images.unsplash.com/photo-1585139786570-355c88231b55?auto=format&fit=crop&q=80&w=2000"
                alt="Artesano trabajando el cuero"
                className="rounded-lg shadow-xl w-full h-64 md:h-80 lg:h-96 object-cover"
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
      <section id="contact" className="py-16 md:py-24 scroll-mt-16 bg-[#f8f5f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 md:mb-12 text-center">Contacto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 md:w-8 md:h-8 text-[#2c2420]" />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">Teléfono</h3>
              <p className="text-center text-gray-600">+34 900 123 456</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 md:w-8 md:h-8 text-[#2c2420]" />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">Email</h3>
              <p className="text-center text-gray-600">info@cuero.com</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 md:w-8 md:h-8 text-[#2c2420]" />
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
              aria-label="Cerrar"
            >
              <X size={24} className="text-gray-700" />
            </button>
            
            <div className="p-4 md:p-6">
              <div className="relative">
                <img
                  src={selectedProduct.images[currentImageIndex]?.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover rounded-lg"
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
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={20} className="md:w-6 md:h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight size={20} className="md:w-6 md:h-6" />
                    </button>
                  </>
                )}
              </div>

              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2 md:gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {selectedProduct.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-none w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-md overflow-hidden ${
                        currentImageIndex === index ? 'ring-2 ring-[#2c2420]' : ''
                      }`}
                      aria-label={`Ver imagen ${index + 1} de ${selectedProduct.name}`}
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

              <div className="mt-6 md:mt-8">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                    {selectedProduct.name}
                  </h2>
                  {selectedProduct.featured && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                      Destacado
                    </span>
                  )}
                </div>
                {selectedProduct.price && (
                  <p className="text-xl md:text-2xl text-[#2c2420] font-medium mt-2">
                    ${selectedProduct.price.toFixed(2)}
                  </p>
                )}
                <p className="text-gray-600 mt-4 leading-relaxed text-sm md:text-base">{selectedProduct.description}</p>
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href={`https://wa.me/1234567890?text=Hola, me interesa el producto: ${selectedProduct.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white px-4 md:px-8 py-3 md:py-4 rounded-md hover:bg-[#128C7E] transition-colors duration-300 font-medium text-base md:text-lg text-center"
                  >
                    Contactar por WhatsApp
                  </a>
                  <a
                    href={`mailto:info@cuero.com?subject=Consulta sobre ${selectedProduct.name}`}
                    className="w-full bg-[#2c2420] text-white px-4 md:px-8 py-3 md:py-4 rounded-md hover:bg-[#3c3430] transition-colors duration-300 font-medium text-base md:text-lg text-center"
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