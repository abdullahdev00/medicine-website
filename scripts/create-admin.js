// Script to create admin user using Supabase Admin API
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Create user using Admin API
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: 'adminmedicine@gmail.com',
      password: 'MedAdmin2024!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Medicine Store Admin'
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }

    console.log('User created:', user.user.id);

    // Add to admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.user.id,
        role: 'super_admin',
        permissions: ["manage_products", "manage_orders", "manage_users", "view_analytics", "manage_payments", "manage_settings"],
        is_active: true,
        department: 'Administration',
        access_level: 'full'
      });

    if (adminError) {
      console.error('Error creating admin record:', adminError);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.user.id,
        phone_number: '+92-300-1234567',
        whatsapp_number: '+92-300-1234567',
        profile_completed: true
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    // Create entry in public.users table
    const { error: publicUserError } = await supabase
      .from('users')
      .insert({
        id: user.user.id,
        email: 'adminmedicine@gmail.com',
        full_name: 'Medicine Store Admin',
        password: '', // Password handled by Auth
        created_at: new Date().toISOString()
      });

    if (publicUserError) {
      console.error('Error creating public user:', publicUserError);
      // This is okay if the table doesn't exist
    }

    console.log('Admin user created successfully!');
    console.log('Email: adminmedicine@gmail.com');
    console.log('Password: MedAdmin2024!');
    console.log('User ID:', user.user.id);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();
