import { db } from '../db/index';
import { admins, categories, products, paymentAccounts } from '@shared/schema';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.insert(admins).values({
      fullName: 'Admin User',
      email: 'admin@karoo.com',
      password: hashedPassword,
      isActive: true,
    });
    console.log('✅ Admin user created: admin@karoo.com / admin123');

    // Create categories
    console.log('Creating categories...');
    const categoriesData = [
      {
        name: 'Pain Relief',
        icon: 'pill',
        description: 'Pain relief and anti-inflammatory medications',
      },
      {
        name: 'Vitamins & Supplements',
        icon: 'capsule',
        description: 'Essential vitamins and dietary supplements',
      },
      {
        name: 'First Aid',
        icon: 'bandage',
        description: 'First aid supplies and wound care',
      },
      {
        name: 'Cold & Flu',
        icon: 'thermometer',
        description: 'Cold, flu, and allergy relief',
      },
      {
        name: 'Digestive Health',
        icon: 'stomach',
        description: 'Digestive aids and stomach care',
      },
      {
        name: 'Personal Care',
        icon: 'heart',
        description: 'Personal hygiene and wellness products',
      },
    ];

    const insertedCategories = await db.insert(categories).values(categoriesData).returning();
    console.log(`✅ Created ${insertedCategories.length} categories`);

    // Create products
    console.log('Creating products...');
    const productsData = [
      {
        name: 'Paracetamol Extra Strength',
        categoryId: insertedCategories[0].id,
        description: 'Extra strength pain relief for headaches, muscle aches, and fever. Fast-acting formula provides effective relief.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.5',
        variants: [
          { name: '24 Tablets', price: '89.99', wholesalePrice: '65.00' },
          { name: '48 Tablets', price: '159.99', wholesalePrice: '120.00' },
        ],
        inStock: true,
      },
      {
        name: 'Ibuprofen 400mg',
        categoryId: insertedCategories[0].id,
        description: 'Anti-inflammatory pain relief for arthritis, back pain, and inflammation.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.7',
        variants: [
          { name: '20 Tablets', price: '99.99', wholesalePrice: '75.00' },
          { name: '40 Tablets', price: '179.99', wholesalePrice: '135.00' },
        ],
        inStock: true,
      },
      {
        name: 'Multivitamin Daily',
        categoryId: insertedCategories[1].id,
        description: 'Complete daily multivitamin with essential vitamins and minerals for overall health and wellness.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.6',
        variants: [
          { name: '30 Capsules', price: '249.99', wholesalePrice: '180.00' },
          { name: '60 Capsules', price: '449.99', wholesalePrice: '320.00' },
        ],
        inStock: true,
      },
      {
        name: 'Vitamin C 1000mg',
        categoryId: insertedCategories[1].id,
        description: 'High-potency vitamin C for immune support and antioxidant protection.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.8',
        variants: [
          { name: '30 Tablets', price: '199.99', wholesalePrice: '145.00' },
          { name: '60 Tablets', price: '359.99', wholesalePrice: '260.00' },
        ],
        inStock: true,
      },
      {
        name: 'First Aid Kit Premium',
        categoryId: insertedCategories[2].id,
        description: 'Comprehensive first aid kit with bandages, antiseptics, and essential medical supplies.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.9',
        variants: [
          { name: 'Small Kit', price: '599.99', wholesalePrice: '450.00' },
          { name: 'Large Kit', price: '999.99', wholesalePrice: '750.00' },
        ],
        inStock: true,
      },
      {
        name: 'Antiseptic Spray',
        categoryId: insertedCategories[2].id,
        description: 'Fast-acting antiseptic spray for cleaning wounds and preventing infection.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.4',
        variants: [
          { name: '50ml', price: '89.99', wholesalePrice: '65.00' },
          { name: '100ml', price: '149.99', wholesalePrice: '110.00' },
        ],
        inStock: true,
      },
      {
        name: 'Cold & Flu Relief',
        categoryId: insertedCategories[3].id,
        description: 'Multi-symptom cold and flu relief for congestion, cough, and fever.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.5',
        variants: [
          { name: '24 Tablets', price: '129.99', wholesalePrice: '95.00' },
          { name: '48 Tablets', price: '229.99', wholesalePrice: '170.00' },
        ],
        inStock: true,
      },
      {
        name: 'Cough Syrup',
        categoryId: insertedCategories[3].id,
        description: 'Soothing cough syrup for dry and wet coughs with honey flavor.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.3',
        variants: [
          { name: '100ml', price: '119.99', wholesalePrice: '85.00' },
          { name: '200ml', price: '199.99', wholesalePrice: '145.00' },
        ],
        inStock: true,
      },
      {
        name: 'Probiotic Digestive Support',
        categoryId: insertedCategories[4].id,
        description: 'Advanced probiotic formula for digestive health and gut flora balance.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.7',
        variants: [
          { name: '30 Capsules', price: '299.99', wholesalePrice: '220.00' },
          { name: '60 Capsules', price: '549.99', wholesalePrice: '400.00' },
        ],
        inStock: true,
      },
      {
        name: 'Antacid Tablets',
        categoryId: insertedCategories[4].id,
        description: 'Fast-acting antacid for heartburn and acid indigestion relief.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.2',
        variants: [
          { name: '24 Tablets', price: '79.99', wholesalePrice: '55.00' },
          { name: '48 Tablets', price: '139.99', wholesalePrice: '100.00' },
        ],
        inStock: true,
      },
      {
        name: 'Hand Sanitizer Gel',
        categoryId: insertedCategories[5].id,
        description: '70% alcohol hand sanitizer gel for effective germ protection.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.6',
        variants: [
          { name: '50ml', price: '49.99', wholesalePrice: '35.00' },
          { name: '250ml', price: '149.99', wholesalePrice: '110.00' },
          { name: '500ml', price: '249.99', wholesalePrice: '180.00' },
        ],
        inStock: true,
      },
      {
        name: 'Face Masks (Surgical)',
        categoryId: insertedCategories[5].id,
        description: 'Disposable 3-ply surgical face masks for everyday protection.',
        images: ['/placeholder-medicine.jpg'],
        rating: '4.5',
        variants: [
          { name: '50 Pack', price: '299.99', wholesalePrice: '220.00' },
          { name: '100 Pack', price: '549.99', wholesalePrice: '400.00' },
        ],
        inStock: true,
      },
    ];

    await db.insert(products).values(productsData);
    console.log(`✅ Created ${productsData.length} products`);

    // Create payment accounts
    console.log('Creating payment accounts...');
    const paymentAccountsData = [
      {
        method: 'Bank Transfer',
        accountName: 'Karoo Pharmacy Ltd',
        accountNumber: 'PK12BANK0000123456789012',
        isActive: true,
      },
      {
        method: 'JazzCash',
        accountName: 'Karoo Pharmacy',
        accountNumber: '03001234567',
        isActive: true,
      },
      {
        method: 'EasyPaisa',
        accountName: 'Karoo Pharmacy',
        accountNumber: '03009876543',
        isActive: true,
      },
    ];

    await db.insert(paymentAccounts).values(paymentAccountsData);
    console.log(`✅ Created ${paymentAccountsData.length} payment accounts`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('  - Admin User: admin@karoo.com / admin123');
    console.log(`  - Categories: ${insertedCategories.length}`);
    console.log(`  - Products: ${productsData.length}`);
    console.log(`  - Payment Accounts: ${paymentAccountsData.length}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
