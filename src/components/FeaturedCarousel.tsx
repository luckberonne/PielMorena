import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types/product';

interface FeaturedCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function FeaturedCarousel({ products, onProductClick }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSlidesToShow(3);
      } else if (window.innerWidth >= 768) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!products?.length || products.length <= slidesToShow) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= products.length - slidesToShow ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [products, slidesToShow]);

  const nextSlide = () => {
    if (!products?.length) return;
    setCurrentIndex((prevIndex) => 
      prevIndex >= products.length - slidesToShow ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (!products?.length) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - slidesToShow : prevIndex - 1
    );
  };

  if (!products?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
        Productos Destacados
      </h2>
      <div className="relative">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)` }}
          >
            {products.map((product) => (
              <div 
                key={product.id}
                className={`w-full flex-shrink-0 px-4`}
                style={{ flex: `0 0 ${100 / slidesToShow}%` }}
              >
                <div 
                  className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  onClick={() => onProductClick(product)}
                >
                  <div className="aspect-w-1 aspect-h-1 overflow-hidden">
                    <img
                      src={product.images[0]?.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
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
        {products.length > slidesToShow && (
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
          </>
        )}
      </div>
    </section>
  );
}