import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function enableRLS() {
  try {
    console.log('🔒 Enabling Row Level Security (RLS) policies...\n');

    // Enable RLS on user-specific tables
    console.log('📋 Step 1: Enabling RLS on tables...');
    
    await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE orders ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE addresses ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE user_payment_accounts ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE user_vouchers ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE partners ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE admins ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY`;
    
    console.log('✅ RLS enabled on all user-specific tables\n');

    // Create policies for users table
    console.log('👤 Step 2: Creating policies for users table...');
    
    await sql`
      CREATE POLICY users_select_own 
      ON users 
      FOR SELECT 
      USING (id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY users_update_own 
      ON users 
      FOR UPDATE 
      USING (id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Users policies created\n');

    // Create policies for orders table
    console.log('📦 Step 3: Creating policies for orders table...');
    
    await sql`
      CREATE POLICY orders_select_own 
      ON orders 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY orders_insert_own 
      ON orders 
      FOR INSERT 
      WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Orders policies created\n');

    // Create policies for addresses table
    console.log('🏠 Step 4: Creating policies for addresses table...');
    
    await sql`
      CREATE POLICY addresses_select_own 
      ON addresses 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY addresses_insert_own 
      ON addresses 
      FOR INSERT 
      WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY addresses_update_own 
      ON addresses 
      FOR UPDATE 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY addresses_delete_own 
      ON addresses 
      FOR DELETE 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Addresses policies created\n');

    // Create policies for wishlist_items table
    console.log('💚 Step 5: Creating policies for wishlist_items table...');
    
    await sql`
      CREATE POLICY wishlist_select_own 
      ON wishlist_items 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY wishlist_insert_own 
      ON wishlist_items 
      FOR INSERT 
      WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY wishlist_delete_own 
      ON wishlist_items 
      FOR DELETE 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Wishlist policies created\n');

    // Create policies for wallet_transactions table
    console.log('💰 Step 6: Creating policies for wallet_transactions table...');
    
    await sql`
      CREATE POLICY wallet_transactions_select_own 
      ON wallet_transactions 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Wallet transactions policies created\n');

    // Create policies for user_payment_accounts table
    console.log('💳 Step 7: Creating policies for user_payment_accounts table...');
    
    await sql`
      CREATE POLICY user_payment_accounts_select_own 
      ON user_payment_accounts 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY user_payment_accounts_insert_own 
      ON user_payment_accounts 
      FOR INSERT 
      WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY user_payment_accounts_update_own 
      ON user_payment_accounts 
      FOR UPDATE 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY user_payment_accounts_delete_own 
      ON user_payment_accounts 
      FOR DELETE 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ User payment accounts policies created\n');

    // Create policies for user_vouchers table
    console.log('🎟️ Step 8: Creating policies for user_vouchers table...');
    
    await sql`
      CREATE POLICY user_vouchers_select_own 
      ON user_vouchers 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ User vouchers policies created\n');

    // Create policies for referral_stats table
    console.log('📊 Step 9: Creating policies for referral_stats table...');
    
    await sql`
      CREATE POLICY referral_stats_select_own 
      ON referral_stats 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Referral stats policies created\n');

    // Create policies for partners table
    console.log('🤝 Step 10: Creating policies for partners table...');
    
    await sql`
      CREATE POLICY partners_select_own 
      ON partners 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Partners policies created\n');

    // Create policies for partner_applications table
    console.log('📝 Step 11: Creating policies for partner_applications table...');
    
    await sql`
      CREATE POLICY partner_applications_select_own 
      ON partner_applications 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY partner_applications_insert_own 
      ON partner_applications 
      FOR INSERT 
      WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Partner applications policies created\n');

    // Create policies for payment_requests table
    console.log('💸 Step 12: Creating policies for payment_requests table...');
    
    await sql`
      CREATE POLICY payment_requests_select_own 
      ON payment_requests 
      FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY payment_requests_insert_own 
      ON payment_requests 
      FOR INSERT 
      WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid)
    `;
    
    console.log('✅ Payment requests policies created\n');

    // Create admin-only policies
    console.log('👨‍💼 Step 13: Creating admin-only policies...');
    
    await sql`
      CREATE POLICY admins_select_self 
      ON admins 
      FOR SELECT 
      USING (id = current_setting('app.current_admin_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY activity_logs_admin_only 
      ON activity_logs 
      FOR SELECT 
      USING (admin_id = current_setting('app.current_admin_id', true)::uuid)
    `;
    
    await sql`
      CREATE POLICY activity_logs_insert_admin 
      ON activity_logs 
      FOR INSERT 
      WITH CHECK (admin_id = current_setting('app.current_admin_id', true)::uuid)
    `;
    
    console.log('✅ Admin policies created\n');

    console.log('✅ RLS policies enabled successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 RLS SUMMARY:');
    console.log('═══════════════════════════════════════════════════');
    console.log('✓ Users can only view/update their own data');
    console.log('✓ Orders are restricted to owner');
    console.log('✓ Addresses are restricted to owner');
    console.log('✓ Wishlist items are restricted to owner');
    console.log('✓ Wallet transactions are view-only for owner');
    console.log('✓ Payment accounts are restricted to owner');
    console.log('✓ Vouchers, referrals, partners restricted to owner');
    console.log('✓ Admin tables are admin-only access');
    console.log('✓ Public tables (products, categories) remain open');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('💡 NOTE: To use RLS policies in your app, set the following');
    console.log('   session variables before queries:');
    console.log('   - For users: SET app.current_user_id = \'<user-id>\'');
    console.log('   - For admins: SET app.current_admin_id = \'<admin-id>\'\n');

  } catch (error) {
    console.error('❌ Error enabling RLS:', error);
    throw error;
  }
}

enableRLS()
  .then(() => {
    console.log('✨ RLS setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to enable RLS:', error);
    process.exit(1);
  });
