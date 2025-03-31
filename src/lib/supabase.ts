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

    if (error && error.message !== 'User already registered') {
      console.error('Error creating admin user:', error.message);
    } else if (user) {
      console.log('Admin user created successfully');
    }
  } catch (err) {
    console.error('Error initializing admin user:', err);
  }
};

// Call this function when the app starts
initializeAdminUser();