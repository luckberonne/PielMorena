import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    closeMenu();
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold text-gray-900">PielMorena</Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="font-sans text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={closeMenu}
            >
              Inicio
            </Link>
            <Link 
              to="/collection" 
              className="font-sans text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={closeMenu}
            >
              Colección
            </Link>
            <a 
              href="/#about" 
              className="font-sans text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              Nosotros
            </a>
            <a 
              href="/#contact" 
              className="font-sans text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={(e) => handleNavClick(e, 'contact')}
            >
              Contacto
            </a>
            <Link 
              to="/admin" 
              className="font-sans text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={closeMenu}
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={closeMenu}
            >
              Inicio
            </Link>
            <Link 
              to="/collection" 
              className="block px-3 py-2 text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={closeMenu}
            >
              Colección
            </Link>
            <a 
              href="/#about" 
              className="block px-3 py-2 text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              Nosotros
            </a>
            <a 
              href="/#contact" 
              className="block px-3 py-2 text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={(e) => handleNavClick(e, 'contact')}
            >
              Contacto
            </a>
            <Link 
              to="/admin" 
              className="block px-3 py-2 text-gray-900 hover:text-[#3c3430] transition-colors duration-300"
              onClick={closeMenu}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}