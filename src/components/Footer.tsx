import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2c2420] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-serif font-bold mb-4 md:mb-0">PielMorena</div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-300">
              <Facebook size={24} />
            </a>
            <a href="#" className="hover:text-gray-300">
              <Instagram size={24} />
            </a>
            <a href="#" className="hover:text-gray-300">
              <Twitter size={24} />
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          © 2025 PielMorena. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}