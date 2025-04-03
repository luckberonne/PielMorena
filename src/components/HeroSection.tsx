import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

export default function HeroSection({ onScrollToSection }: HeroSectionProps) {
  const { settings } = useSiteSettings();

  return (
    <div className="relative pt-16">
      <div className="absolute inset-0 h-full">
        <img
          className="w-full h-full object-cover"
          src={settings?.hero_image || 'https://images.unsplash.com/photo-1614252240798-17e859b3e353?auto=format&fit=crop&q=80&w=2000'}
          alt="Zapatos artesanales de cuero premium"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&q=80&w=2000';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white">
          Artesanía en Cuero
        </h1>
        <p className="mt-4 sm:mt-6 max-w-3xl text-lg sm:text-xl text-gray-100 font-sans">
          Descubre nuestra colección de zapatos artesanales, donde cada pieza es una obra maestra de calidad y estilo.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/collection"
            className="inline-block bg-white text-gray-900 px-8 py-3 text-lg font-medium rounded-md hover:bg-gray-100 transition-colors duration-300 text-center"
          >
            Ver Colección
          </Link>
          <button
            onClick={() => onScrollToSection('contact')}
            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 text-lg font-medium rounded-md hover:bg-white/10 transition-colors duration-300"
          >
            Contáctanos
          </button>
        </div>
      </div>
    </div>
  );
}