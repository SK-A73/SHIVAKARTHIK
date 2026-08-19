const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://dosrreuhogluiguyxwze.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. Image uploads will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey || 'dummy_key');

const uploadToSupabase = async (file) => {
  if (!supabaseKey || supabaseKey === 'dummy_key') {
    throw new Error('Supabase credentials missing. Please set SUPABASE_SERVICE_ROLE_KEY.');
  }
  
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabase.storage
    .from('shop_products')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    // If bucket doesn't exist, we might get an error, but let's assume it exists or we can create it in admin
    console.error('Supabase upload error:', error);
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('shop_products')
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    path: filePath
  };
};

const deleteFromSupabase = async (filePath) => {
  if (!filePath || !supabaseKey || supabaseKey === 'dummy_key') return;
  const { error } = await supabase.storage
    .from('shop_products')
    .remove([filePath]);
  
  if (error) {
    console.error('Supabase delete error:', error);
  }
};

module.exports = { supabase, uploadToSupabase, deleteFromSupabase };
