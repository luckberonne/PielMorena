import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Banner() {
  const { settings } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('hasSeenBanner');
    if (!hasSeenBanner && settings?.banner_enabled && settings.banner_text) {
      setIsOpen(true);
    }
  }, [settings]);

  const closeBanner = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenBanner', 'true');
  };

  if (!settings?.banner_enabled || !settings.banner_text || !isOpen) {
    return null;
  }

  const BannerContent = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden relative"
        style={settings.banner_image ? {
          backgroundImage: `url(${settings.banner_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {settings.banner_image && (
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        )}
        <button
          onClick={closeBanner}
          className="absolute top-2 right-2 text-white hover:text-gray-200 z-20"
        >
          <X size={24} />
        </button>
        <div className="p-8 relative z-10">
          <p className={`text-xl text-center ${settings.banner_image ? 'text-white' : 'text-gray-900'}`}>
            {settings.banner_text}
          </p>
          {settings.banner_link && (
            <div className="mt-6 text-center">
              <Link
                to={settings.banner_link}
                className="inline-block bg-[#2c2420] text-white px-6 py-2 rounded-md hover:bg-[#3c3430] transition-colors duration-300"
                onClick={closeBanner}
              >
                Ver más
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return settings.banner_link ? (
    <BannerContent />
  ) : (
    <BannerContent />
  );
}