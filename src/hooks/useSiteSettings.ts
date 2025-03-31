import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettings } from '../types/product';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (fetchError) throw fetchError;
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error loading site settings:', err);
      setError('Error al cargar la configuración del sitio');
    } finally {
      setLoading(false);
    }
  };

  const updateHeroImage = async (imageFile: File) => {
    try {
      if (!settings?.id) throw new Error('No settings found');
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `hero/hero-image.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ hero_image: publicUrl })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      await loadSettings();
      return publicUrl;
    } catch (err) {
      console.error('Error updating hero image:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateHeroImage,
    refresh: loadSettings
  };
}