import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin credentials - these must match the user created in Supabase Auth
export const ADMIN_EMAIL = 'admin@cuero.com';
export const ADMIN_PASSWORD = 'admin123456';

// Initialize admin user if it doesn't exist
export const initializeAdminUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    // Ignore "User already registered" error as it's expected
    if (error && error.message !== 'User already registered') {
      console.error('Error creating admin user:', error.message);
    }
  } catch (err) {
    console.error('Error initializing admin user:', err);
  }
};

// Initialize storage buckets
export const initializeStorage = async () => {
  try {
    // Create product-images bucket if it doesn't exist
    const { data: productBucket, error: productError } = await supabase
      .storage
      .createBucket('product-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

    if (productError && !productError.message.includes('already exists')) {
      console.error('Error creating product-images bucket:', productError);
    }

    // Create site-images bucket if it doesn't exist
    const { data: siteBucket, error: siteError } = await supabase
      .storage
      .createBucket('site-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

    if (siteError && !siteError.message.includes('already exists')) {
      console.error('Error creating site-images bucket:', siteError);
    }
  } catch (err) {
    console.error('Error initializing storage buckets:', err);
  }
};

// Initialize everything when the app starts
Promise.all([
  initializeAdminUser(),
  initializeStorage()
]).catch(err => {
  console.error('Error during initialization:', err);
});