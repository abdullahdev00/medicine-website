const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

// Load environment variables
config();

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');

  // Check environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log('\n📝 Please create a .env.local file with the required variables.');
    console.log('   You can copy .env.example and fill in your values.\n');
    process.exit(1);
  }

  // Test Supabase connection
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Test connection by checking categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (catError) {
      console.error('❌ Database connection failed:', catError.message);
      console.log('\n📝 Please ensure:');
      console.log('   1. Your Supabase project is active');
      console.log('   2. The database URL is correct');
      console.log('   3. Tables have been created\n');
      process.exit(1);
    }

    console.log('✅ Database connection successful!');

    // Check for products table
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (prodError) {
      console.log('⚠️  Products table not found or empty');
    } else {
      console.log('✅ Products table exists');
    }

    // Check for categories
    const { data: catData, error: catDataError } = await supabase
      .from('categories')
      .select('*');

    if (!catDataError && catData) {
      console.log(`✅ Found ${catData.length} categories`);
      
      if (catData.length === 0) {
        console.log('\n📝 No categories found. Creating default categories...');
        
        const defaultCategories = [
          { name: 'Medicines', description: 'Prescription and OTC medicines' },
          { name: 'Vitamins & Supplements', description: 'Health supplements and vitamins' },
          { name: 'Personal Care', description: 'Personal hygiene and care products' },
          { name: 'Baby Care', description: 'Baby health and care products' },
          { name: 'First Aid', description: 'First aid and emergency supplies' }
        ];

        const { error: insertError } = await supabase
          .from('categories')
          .insert(defaultCategories);

        if (insertError) {
          console.error('❌ Failed to create categories:', insertError.message);
        } else {
          console.log('✅ Default categories created');
        }
      }
    }

    console.log('\n🎉 Database setup complete!');
    console.log('   You can now run: npm run dev\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
