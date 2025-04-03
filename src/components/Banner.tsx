import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Banner() {
  const { settings } = useSiteSettings();

  if (!settings?.banner_enabled || !settings.banner_text) {
    return null;
  }

  const BannerContent = () => (
    <div 
      className="bg-[#2c2420] text-white py-2 px-4 relative flex items-center justify-center"
      style={settings.banner_image ? {
        backgroundImage: `url(${settings.banner_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}
    >
      {settings.banner_image && (
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      )}
      <p className="text-sm sm:text-base relative z-10">
        {settings.banner_text}
      </p>
    </div>
  );

  return settings.banner_link ? (
    <Link to={settings.banner_link}>
      <BannerContent />
    </Link>
  ) : (
    <BannerContent />
  );
}