import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Supabase connection for seeding
const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 10,
  connection: {
    options: `--search_path=public`,
  },
});
const db = drizzle(client, { schema });

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    // ===== STEP 1: Create Admin Users =====
    console.log('👨‍💼 Step 1: Creating admin users...');
    const admins = await db.insert(schema.admins).values([
      {
        fullName: 'Super Admin',
        email: 'admin@pharmacy.com',
        password: hashedAdminPassword,
        isActive: true,
      },
      {
        fullName: 'Support Admin',
        email: 'support@pharmacy.com',
        password: hashedAdminPassword,
        isActive: true,
      },
    ]).returning();
    console.log(`✅ Created ${admins.length} admin users\n`);

    // ===== STEP 2: Create Categories =====
    console.log('📂 Step 2: Creating categories...');
    const categories = await db.insert(schema.categories).values([
      { name: 'Pain Relief', icon: 'Zap', description: 'Over-the-counter pain relief medications' },
      { name: 'Vitamins & Supplements', icon: 'Pill', description: 'Daily vitamins and dietary supplements' },
      { name: 'Cold & Flu', icon: 'Thermometer', description: 'Cold, flu, and allergy medications' },
      { name: 'First Aid', icon: 'Heart', description: 'First aid supplies and wound care' },
      { name: 'Diabetes Care', icon: 'Activity', description: 'Diabetes management and monitoring' },
      { name: 'Skincare', icon: 'Droplets', description: 'Skincare and dermatology products' },
      { name: 'Baby Care', icon: 'Baby', description: 'Baby health and wellness products' },
      { name: 'Heart Health', icon: 'HeartPulse', description: 'Cardiovascular health supplements' },
      { name: 'Personal Care', icon: 'User', description: 'Personal hygiene products' },
    ]).returning();
    console.log(`✅ Created ${categories.length} categories\n`);

    const categoryMap = new Map(categories.map(c => [c.name, c.id]));

    // ===== STEP 3: Create Products =====
    console.log('🛍️ Step 3: Creating products...');
    const products = await db.insert(schema.products).values([
      // Pain Relief
      {
        name: 'Paracetamol 500mg',
        categoryId: categoryMap.get('Pain Relief')!,
        description: 'Effective pain relief and fever reducer. Suitable for headaches, muscle aches, and minor pains.',
        images: ['/images/placeholder.svg'],
        rating: '4.5',
        variants: [
          { name: '10 Tablets', price: '250', wholesalePrice: '200' },
          { name: '20 Tablets', price: '450', wholesalePrice: '380' },
          { name: '50 Tablets', price: '1000', wholesalePrice: '850' },
        ],
        inStock: true,
      },
      {
        name: 'Ibuprofen 400mg',
        categoryId: categoryMap.get('Pain Relief')!,
        description: 'Anti-inflammatory pain reliever for mild to moderate pain, fever, and inflammation.',
        images: ['/images/placeholder.svg'],
        rating: '4.7',
        variants: [
          { name: '10 Tablets', price: '350', wholesalePrice: '280' },
          { name: '20 Tablets', price: '650', wholesalePrice: '520' },
        ],
        inStock: true,
      },
      // Vitamins
      {
        name: 'Vitamin C 1000mg',
        categoryId: categoryMap.get('Vitamins & Supplements')!,
        description: 'Immune system support with high-potency vitamin C. Promotes healthy skin and antioxidant protection.',
        images: ['/images/placeholder.svg'],
        rating: '4.8',
        variants: [
          { name: '30 Tablets', price: '800', wholesalePrice: '650' },
          { name: '60 Tablets', price: '1500', wholesalePrice: '1250' },
          { name: '90 Tablets', price: '2100', wholesalePrice: '1800' },
        ],
        inStock: true,
      },
      {
        name: 'Multivitamin Complex',
        categoryId: categoryMap.get('Vitamins & Supplements')!,
        description: 'Complete daily multivitamin with essential vitamins and minerals for overall health.',
        images: ['/images/placeholder.svg'],
        rating: '4.6',
        variants: [
          { name: '30 Capsules', price: '1200', wholesalePrice: '1000' },
          { name: '60 Capsules', price: '2200', wholesalePrice: '1850' },
        ],
        inStock: true,
      },
      {
        name: 'Vitamin D3 5000 IU',
        categoryId: categoryMap.get('Vitamins & Supplements')!,
        description: 'High-potency vitamin D for bone health and immune support.',
        images: ['/images/placeholder.svg'],
        rating: '4.7',
        variants: [
          { name: '30 Tablets', price: '650', wholesalePrice: '520' },
          { name: '60 Tablets', price: '1200', wholesalePrice: '960' },
        ],
        inStock: true,
      },
      // Cold & Flu
      {
        name: 'Cold Relief Syrup',
        categoryId: categoryMap.get('Cold & Flu')!,
        description: 'Relieves cold symptoms including cough, congestion, and sore throat.',
        images: ['/images/placeholder.svg'],
        rating: '4.4',
        variants: [
          { name: '100ml Bottle', price: '450', wholesalePrice: '370' },
          { name: '200ml Bottle', price: '800', wholesalePrice: '650' },
        ],
        inStock: true,
      },
      {
        name: 'Antihistamine Tablets',
        categoryId: categoryMap.get('Cold & Flu')!,
        description: 'Fast-acting allergy relief for sneezing, runny nose, and itchy eyes.',
        images: ['/images/placeholder.svg'],
        rating: '4.5',
        variants: [
          { name: '10 Tablets', price: '400', wholesalePrice: '330' },
          { name: '20 Tablets', price: '750', wholesalePrice: '620' },
        ],
        inStock: true,
      },
      // First Aid
      {
        name: 'Adhesive Bandages (Band-Aid)',
        categoryId: categoryMap.get('First Aid')!,
        description: 'Sterile adhesive bandages for minor cuts and wounds. Various sizes included.',
        images: ['/images/placeholder.svg'],
        rating: '4.7',
        variants: [
          { name: '20 Pack', price: '300', wholesalePrice: '240' },
          { name: '50 Pack', price: '650', wholesalePrice: '520' },
          { name: '100 Pack', price: '1200', wholesalePrice: '980' },
        ],
        inStock: true,
      },
      {
        name: 'Antiseptic Solution',
        categoryId: categoryMap.get('First Aid')!,
        description: 'Antiseptic for cleaning and preventing infection in minor cuts and scrapes.',
        images: ['/images/placeholder.svg'],
        rating: '4.6',
        variants: [
          { name: '100ml Bottle', price: '350', wholesalePrice: '280' },
          { name: '250ml Bottle', price: '750', wholesalePrice: '600' },
        ],
        inStock: true,
      },
      {
        name: 'First Aid Kit Complete',
        categoryId: categoryMap.get('First Aid')!,
        description: 'Comprehensive first aid kit for home and travel.',
        images: ['/images/placeholder.svg'],
        rating: '4.8',
        variants: [
          { name: 'Basic Kit', price: '1200', wholesalePrice: '960' },
          { name: 'Premium Kit', price: '2500', wholesalePrice: '2000' },
        ],
        inStock: true,
      },
      // Diabetes Care
      {
        name: 'Blood Glucose Test Strips',
        categoryId: categoryMap.get('Diabetes Care')!,
        description: 'Accurate blood glucose monitoring test strips compatible with most meters.',
        images: ['/images/placeholder.svg'],
        rating: '4.8',
        variants: [
          { name: '25 Strips', price: '1500', wholesalePrice: '1250' },
          { name: '50 Strips', price: '2800', wholesalePrice: '2350' },
          { name: '100 Strips', price: '5200', wholesalePrice: '4400' },
        ],
        inStock: true,
      },
      {
        name: 'Blood Glucose Monitor Kit',
        categoryId: categoryMap.get('Diabetes Care')!,
        description: 'Complete kit for monitoring blood glucose levels at home.',
        images: ['/images/placeholder.svg'],
        rating: '4.9',
        variants: [
          { name: 'With 50 Test Strips', price: '3500', wholesalePrice: '2800' },
          { name: 'With 100 Test Strips', price: '5200', wholesalePrice: '4160' },
        ],
        inStock: true,
      },
      {
        name: 'Digital Thermometer',
        categoryId: categoryMap.get('First Aid')!,
        description: 'Fast and accurate digital thermometer for oral, rectal, or underarm use.',
        images: ['/images/placeholder.svg'],
        rating: '4.5',
        variants: [
          { name: 'Standard', price: '850', wholesalePrice: '700' },
          { name: 'Premium (Fast Read)', price: '1200', wholesalePrice: '1000' },
        ],
        inStock: true,
      },
      // Skincare
      {
        name: 'Moisturizing Cream',
        categoryId: categoryMap.get('Skincare')!,
        description: 'Hydrating cream for dry skin. Non-greasy formula suitable for daily use.',
        images: ['/images/placeholder.svg'],
        rating: '4.6',
        variants: [
          { name: '50g Tube', price: '500', wholesalePrice: '400' },
          { name: '100g Tube', price: '900', wholesalePrice: '750' },
        ],
        inStock: true,
      },
      {
        name: 'Sunscreen SPF 50+',
        categoryId: categoryMap.get('Skincare')!,
        description: 'Broad spectrum protection against UVA and UVB rays. Water resistant.',
        images: ['/images/placeholder.svg'],
        rating: '4.7',
        variants: [
          { name: '50ml', price: '650', wholesalePrice: '520' },
          { name: '100ml', price: '1100', wholesalePrice: '900' },
        ],
        inStock: true,
      },
      // Personal Care
      {
        name: 'Hand Sanitizer',
        categoryId: categoryMap.get('Personal Care')!,
        description: '70% alcohol-based sanitizer that kills 99.9% of germs.',
        images: ['/images/placeholder.svg'],
        rating: '4.7',
        variants: [
          { name: '250ml', price: '320', wholesalePrice: '255' },
          { name: '500ml', price: '550', wholesalePrice: '440' },
        ],
        inStock: true,
      },
      {
        name: 'Face Masks',
        categoryId: categoryMap.get('Personal Care')!,
        description: '3-layer surgical face masks for protection.',
        images: ['/images/placeholder.svg'],
        rating: '4.6',
        variants: [
          { name: '50 Pack', price: '850', wholesalePrice: '680' },
          { name: '100 Pack', price: '1600', wholesalePrice: '1280' },
        ],
        inStock: true,
      },
    ]).returning();
    console.log(`✅ Created ${products.length} products\n`);

    // ===== STEP 4: Create Demo Users =====
    console.log('👥 Step 4: Creating demo users...');
    const mainUsers = await db.insert(schema.users).values([
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        phoneNumber: '+92-300-1234567',
        whatsappNumber: '+92-300-1234567',
        address: '123 Main Street, Block A',
        city: 'Karachi',
        province: 'Sindh',
        postalCode: '75500',
        affiliateCode: 'JOHN2024',
        walletBalance: '5000',
        totalEarnings: '12000',
        pendingEarnings: '3000',
        isPartner: true,
      },
      {
        fullName: 'Sarah Ahmed',
        email: 'sarah@example.com',
        password: hashedPassword,
        phoneNumber: '+92-321-9876543',
        whatsappNumber: '+92-321-9876543',
        address: '456 Garden Road',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54000',
        affiliateCode: 'SARAH2024',
        walletBalance: '2500',
        totalEarnings: '8000',
        pendingEarnings: '1500',
        isPartner: false,
      },
      {
        fullName: 'Ali Khan',
        email: 'ali@example.com',
        password: hashedPassword,
        phoneNumber: '+92-333-5554444',
        whatsappNumber: '+92-333-5554444',
        address: '789 University Road',
        city: 'Islamabad',
        province: 'ICT',
        postalCode: '44000',
        affiliateCode: 'ALI2024',
        walletBalance: '1000',
        totalEarnings: '5000',
        pendingEarnings: '500',
        isPartner: false,
      },
    ]).returning();

    // Create referred users
    const referredUsers = await db.insert(schema.users).values([
      {
        fullName: 'Fatima Hassan',
        email: 'fatima@example.com',
        password: hashedPassword,
        phoneNumber: '+92-300-5678901',
        whatsappNumber: '+92-300-5678901',
        address: '101 Model Town',
        city: 'Faisalabad',
        province: 'Punjab',
        postalCode: '38000',
        affiliateCode: 'FATIMA2024',
        referredBy: mainUsers[0].id,
        walletBalance: '1500',
        totalEarnings: '2000',
        pendingEarnings: '200',
        isPartner: false,
      },
      {
        fullName: 'Ahmed Raza',
        email: 'ahmed@example.com',
        password: hashedPassword,
        phoneNumber: '+92-300-6789012',
        whatsappNumber: '+92-300-6789012',
        address: '202 Defence Area',
        city: 'Multan',
        province: 'Punjab',
        postalCode: '60000',
        affiliateCode: 'AHMED2024',
        referredBy: mainUsers[0].id,
        walletBalance: '800',
        totalEarnings: '1500',
        pendingEarnings: '100',
        isPartner: false,
      },
    ]).returning();

    const users = [...mainUsers, ...referredUsers];
    console.log(`✅ Created ${users.length} demo users (${referredUsers.length} referred)\n`);

    // ===== STEP 5: Create Vouchers =====
    console.log('🎟️ Step 5: Creating vouchers...');
    const vouchers = await db.insert(schema.vouchers).values([
      {
        code: 'WELCOME25',
        title: 'Welcome Discount',
        description: 'Get 25% off on your first order',
        discountType: 'percentage',
        discountValue: '25',
        minOrderAmount: '1000',
        maxDiscount: '500',
        expiryDate: new Date('2025-12-31'),
        isActive: true,
        usageLimit: 100,
        usedCount: 12,
      },
      {
        code: 'SAVE200',
        title: 'Flat 200 Off',
        description: 'Flat Rs. 200 off on orders above Rs. 2000',
        discountType: 'fixed',
        discountValue: '200',
        minOrderAmount: '2000',
        expiryDate: new Date('2025-11-30'),
        isActive: true,
        usageLimit: 200,
        usedCount: 45,
      },
      {
        code: 'HEALTH10',
        title: '10% Health Discount',
        description: '10% off on all health and wellness products',
        discountType: 'percentage',
        discountValue: '10',
        minOrderAmount: '500',
        maxDiscount: '300',
        expiryDate: new Date('2025-12-15'),
        isActive: true,
        usageLimit: 500,
        usedCount: 156,
      },
    ]).returning();
    console.log(`✅ Created ${vouchers.length} vouchers\n`);

    // ===== STEP 6: Create Payment Accounts =====
    console.log('💳 Step 6: Creating payment accounts...');
    const paymentAccounts = await db.insert(schema.paymentAccounts).values([
      {
        method: 'JazzCash',
        accountName: 'Pharmacy Store',
        accountNumber: '0300-1234567',
        isActive: true,
      },
      {
        method: 'EasyPaisa',
        accountName: 'Pharmacy Store',
        accountNumber: '0321-7654321',
        isActive: true,
      },
      {
        method: 'Bank Transfer',
        accountName: 'Pharmacy Store Pvt Ltd',
        accountNumber: 'PK12HABB0000001234567890',
        isActive: true,
      },
    ]).returning();
    console.log(`✅ Created ${paymentAccounts.length} payment accounts\n`);

    // ===== STEP 7: Create Addresses =====
    console.log('🏠 Step 7: Creating addresses...');
    await db.insert(schema.addresses).values([
      {
        userId: users[0].id,
        label: 'Home',
        address: '123 Main Street, Block A',
        city: 'Karachi',
        province: 'Sindh',
        postalCode: '75500',
        isDefault: true,
      },
      {
        userId: users[0].id,
        label: 'Office',
        address: 'Office 456, Business Center',
        city: 'Karachi',
        province: 'Sindh',
        postalCode: '75500',
        isDefault: false,
      },
      {
        userId: users[1].id,
        label: 'Home',
        address: '456 Garden Road',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54000',
        isDefault: true,
      },
    ]);
    console.log('✅ Created 3 addresses\n');

    // ===== STEP 8: Create Wishlist Items =====
    console.log('💚 Step 8: Creating wishlist items...');
    await db.insert(schema.wishlistItems).values([
      { userId: users[0].id, productId: products[1].id },
      { userId: users[0].id, productId: products[4].id },
      { userId: users[0].id, productId: products[6].id },
      { userId: users[1].id, productId: products[2].id },
      { userId: users[1].id, productId: products[11].id },
    ]);
    console.log('✅ Created 5 wishlist items\n');

    // ===== STEP 9: Create Orders =====
    console.log('📦 Step 9: Creating sample orders...');
    const orders = await db.insert(schema.orders).values([
      {
        userId: users[0].id,
        products: [
          {
            productId: products[0].id,
            name: products[0].name,
            quantity: 2,
            price: '250',
            variantName: '10 Tablets',
          },
          {
            productId: products[2].id,
            name: products[2].name,
            quantity: 1,
            price: '800',
            variantName: '30 Tablets',
          },
        ],
        totalPrice: '1300',
        deliveryAddress: '123 Main Street, Block A, Karachi, Sindh',
        paymentMethod: 'JazzCash',
        paymentInfo: '0300-1234567',
        paidFromWallet: '0',
        status: 'delivered',
        expectedDelivery: new Date('2025-10-25'),
      },
      {
        userId: users[1].id,
        products: [
          {
            productId: products[1].id,
            name: products[1].name,
            quantity: 1,
            price: '350',
            variantName: '10 Tablets',
          },
        ],
        totalPrice: '350',
        deliveryAddress: '456 Garden Road, Lahore, Punjab',
        paymentMethod: 'EasyPaisa',
        paymentInfo: '0321-9876543',
        paidFromWallet: '0',
        usedAffiliateCode: 'JOHN2024',
        affiliateUserId: users[0].id,
        affiliateCommission: '35',
        status: 'processing',
        expectedDelivery: new Date('2025-10-22'),
      },
      {
        userId: users[2].id,
        products: [
          {
            productId: products[10].id,
            name: products[10].name,
            quantity: 1,
            price: '1500',
            variantName: '25 Strips',
          },
        ],
        totalPrice: '1500',
        deliveryAddress: '789 University Road, Islamabad, ICT',
        paymentMethod: 'Cash on Delivery',
        paidFromWallet: '500',
        usedAffiliateCode: 'SARAH2024',
        affiliateUserId: users[1].id,
        affiliateCommission: '100',
        status: 'pending',
        expectedDelivery: new Date('2025-10-28'),
      },
    ]).returning();
    console.log(`✅ Created ${orders.length} orders\n`);

    // ===== STEP 10: Create Wallet Transactions =====
    console.log('💰 Step 10: Creating wallet transactions...');
    await db.insert(schema.walletTransactions).values([
      {
        userId: users[0].id,
        type: 'credit',
        amount: '500',
        description: 'Affiliate commission from referral',
        status: 'completed',
      },
      {
        userId: users[0].id,
        type: 'credit',
        amount: '750',
        description: 'Affiliate commission from referral',
        status: 'completed',
      },
      {
        userId: users[1].id,
        type: 'debit',
        amount: '200',
        description: 'Withdrawal to bank account',
        status: 'completed',
      },
      {
        userId: users[2].id,
        type: 'debit',
        amount: '500',
        description: 'Paid for order using wallet',
        orderId: orders[2].id,
        status: 'completed',
      },
      {
        userId: users[0].id,
        type: 'credit',
        amount: '2000',
        description: 'Welcome bonus credited',
        status: 'completed',
      },
    ]);
    console.log('✅ Created 5 wallet transactions\n');

    // ===== STEP 11: Create Partner =====
    console.log('🤝 Step 11: Creating partner...');
    await db.insert(schema.partners).values({
      userId: users[0].id,
      programType: 'affiliate',
      businessName: 'John\'s Health Store',
      businessType: 'Retail',
      commissionRate: '10',
      totalSales: '5000',
      status: 'active',
    });
    console.log('✅ Created partner\n');

    // ===== STEP 12: Create Referral Stats =====
    console.log('📊 Step 12: Creating referral stats...');
    await db.insert(schema.referralStats).values({
      userId: users[0].id,
      totalReferrals: 2,
      totalOrders: 5,
      totalCommission: '2500',
    });
    console.log('✅ Created referral stats\n');

    // ===== STEP 13: Create Payment Requests =====
    console.log('💰 Step 13: Creating payment requests...');
    await db.insert(schema.paymentRequests).values([
      {
        userId: users[0].id,
        type: 'withdrawal',
        amount: '1000',
        status: 'pending',
        paymentMethod: 'JazzCash',
      },
      {
        userId: users[1].id,
        type: 'withdrawal',
        amount: '500',
        status: 'completed',
        paymentMethod: 'EasyPaisa',
      },
      {
        userId: users[2].id,
        type: 'withdrawal',
        amount: '750',
        status: 'rejected',
        paymentMethod: 'Bank Transfer',
        rejectionReason: 'Insufficient balance verification',
      },
    ]);
    console.log('✅ Created 3 payment requests\n');

    // ===== STEP 14: Create User Payment Accounts =====
    console.log('💳 Step 14: Creating user payment accounts...');
    await db.insert(schema.userPaymentAccounts).values([
      {
        userId: users[0].id,
        accountName: 'John Doe',
        raastId: 'john@jazzcash',
        isDefault: true,
      },
      {
        userId: users[1].id,
        accountName: 'Sarah Ahmed',
        raastId: 'sarah@easypaisa',
        isDefault: true,
      },
    ]);
    console.log('✅ Created 2 user payment accounts\n');

    console.log('✅ Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✓ ${admins.length} admin users`);
    console.log(`✓ ${categories.length} categories`);
    console.log(`✓ ${products.length} products`);
    console.log(`✓ ${users.length} demo users`);
    console.log(`✓ ${vouchers.length} vouchers`);
    console.log(`✓ ${paymentAccounts.length} payment accounts`);
    console.log(`✓ ${orders.length} orders`);
    console.log(`✓ 3 addresses`);
    console.log(`✓ 5 wishlist items`);
    console.log(`✓ 5 wallet transactions`);
    console.log(`✓ 1 partner`);
    console.log(`✓ 1 referral stats`);
    console.log(`✓ 3 payment requests`);
    console.log(`✓ 2 user payment accounts`);
    console.log('═══════════════════════════════════════════════════');
    console.log('\n💡 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════');
    console.log('👨‍💼 Admin Panel:');
    console.log('   Email: admin@pharmacy.com');
    console.log('   Password: admin123');
    console.log('\n👤 User Accounts:');
    console.log('   Email: john@example.com / sarah@example.com / ali@example.com');
    console.log('   Password: password123');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log('✨ Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed:', error);
    process.exit(1);
  });
