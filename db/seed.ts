import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import bcrypt from 'bcrypt';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Admin Users
    console.log('Creating admin users...');
    const adminUsers = await db.insert(schema.admins).values([
      {
        fullName: 'Admin User',
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
    console.log(`✓ Created ${adminUsers.length} admin users`);

    // 2. Create Categories
    console.log('Creating categories...');
    const categoriesData = await db.insert(schema.categories).values([
      {
        name: 'Pain Relief',
        icon: 'pill',
        description: 'Over-the-counter pain relief medications',
      },
      {
        name: 'Vitamins & Supplements',
        icon: 'capsule',
        description: 'Daily vitamins and dietary supplements',
      },
      {
        name: 'Cold & Flu',
        icon: 'thermometer',
        description: 'Cold, flu, and allergy medications',
      },
      {
        name: 'First Aid',
        icon: 'bandage',
        description: 'First aid supplies and wound care',
      },
      {
        name: 'Diabetes Care',
        icon: 'syringe',
        description: 'Diabetes management and monitoring',
      },
      {
        name: 'Skincare',
        icon: 'spray-can',
        description: 'Skincare and dermatology products',
      },
      {
        name: 'Baby Care',
        icon: 'baby',
        description: 'Baby health and wellness products',
      },
      {
        name: 'Heart Health',
        icon: 'heart-pulse',
        description: 'Cardiovascular health supplements',
      },
    ]).returning();
    console.log(`✓ Created ${categoriesData.length} categories`);

    // 3. Create Products
    console.log('Creating products...');
    const painReliefCat = categoriesData.find(c => c.name === 'Pain Relief')!;
    const vitaminsCat = categoriesData.find(c => c.name === 'Vitamins & Supplements')!;
    const coldFluCat = categoriesData.find(c => c.name === 'Cold & Flu')!;
    const firstAidCat = categoriesData.find(c => c.name === 'First Aid')!;
    const diabetesCat = categoriesData.find(c => c.name === 'Diabetes Care')!;
    const skincareCat = categoriesData.find(c => c.name === 'Skincare')!;

    const products = await db.insert(schema.products).values([
      {
        name: 'Paracetamol 500mg',
        categoryId: painReliefCat.id,
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
        categoryId: painReliefCat.id,
        description: 'Anti-inflammatory pain reliever for mild to moderate pain, fever, and inflammation.',
        images: ['/images/placeholder.svg'],
        rating: '4.7',
        variants: [
          { name: '10 Tablets', price: '350', wholesalePrice: '280' },
          { name: '20 Tablets', price: '650', wholesalePrice: '520' },
        ],
        inStock: true,
      },
      {
        name: 'Vitamin C 1000mg',
        categoryId: vitaminsCat.id,
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
        categoryId: vitaminsCat.id,
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
        name: 'Cold Relief Syrup',
        categoryId: coldFluCat.id,
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
        categoryId: coldFluCat.id,
        description: 'Fast-acting allergy relief for sneezing, runny nose, and itchy eyes.',
        images: ['/images/placeholder.svg'],
        rating: '4.5',
        variants: [
          { name: '10 Tablets', price: '400', wholesalePrice: '330' },
          { name: '20 Tablets', price: '750', wholesalePrice: '620' },
        ],
        inStock: true,
      },
      {
        name: 'Adhesive Bandages (Band-Aid)',
        categoryId: firstAidCat.id,
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
        categoryId: firstAidCat.id,
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
        name: 'Blood Glucose Test Strips',
        categoryId: diabetesCat.id,
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
        name: 'Digital Thermometer',
        categoryId: firstAidCat.id,
        description: 'Fast and accurate digital thermometer for oral, rectal, or underarm use.',
        images: ['/images/placeholder.svg'],
        rating: '4.5',
        variants: [
          { name: 'Standard', price: '850', wholesalePrice: '700' },
          { name: 'Premium (Fast Read)', price: '1200', wholesalePrice: '1000' },
        ],
        inStock: true,
      },
      {
        name: 'Moisturizing Cream',
        categoryId: skincareCat.id,
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
        categoryId: skincareCat.id,
        description: 'Broad spectrum protection against UVA and UVB rays. Water resistant.',
        images: ['/images/placeholder.svg'],
        rating: '4.7',
        variants: [
          { name: '50ml', price: '650', wholesalePrice: '520' },
          { name: '100ml', price: '1100', wholesalePrice: '900' },
        ],
        inStock: true,
      },
    ]).returning();
    console.log(`✓ Created ${products.length} products`);

    // 4. Create Demo Users
    console.log('Creating demo users...');
    const users = await db.insert(schema.users).values([
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
    console.log(`✓ Created ${users.length} demo users`);

    // 5. Create Vouchers
    console.log('Creating vouchers...');
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
        maxDiscount: null,
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
      {
        code: 'EXPIRED50',
        title: 'Expired Voucher',
        description: 'This voucher has expired',
        discountType: 'percentage',
        discountValue: '50',
        minOrderAmount: '1000',
        maxDiscount: '1000',
        expiryDate: new Date('2024-01-01'),
        isActive: false,
        usageLimit: 50,
        usedCount: 50,
      },
    ]).returning();
    console.log(`✓ Created ${vouchers.length} vouchers`);

    // 6. Create Payment Accounts
    console.log('Creating payment accounts...');
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
    console.log(`✓ Created ${paymentAccounts.length} payment accounts`);

    // 7. Create some sample orders
    console.log('Creating sample orders...');
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
        usedAffiliateCode: null,
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
            productId: products[8].id,
            name: products[8].name,
            quantity: 1,
            price: '1500',
            variantName: '25 Strips',
          },
        ],
        totalPrice: '1500',
        deliveryAddress: '789 University Road, Islamabad, ICT',
        paymentMethod: 'Cash on Delivery',
        paymentInfo: null,
        paidFromWallet: '500',
        usedAffiliateCode: 'SARAH2024',
        affiliateUserId: users[1].id,
        affiliateCommission: '100',
        status: 'pending',
        expectedDelivery: new Date('2025-10-28'),
      },
    ]).returning();
    console.log(`✓ Created ${orders.length} sample orders`);

    // 8. Create wallet transactions
    console.log('Creating wallet transactions...');
    const transactions = await db.insert(schema.walletTransactions).values([
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
    ]).returning();
    console.log(`✓ Created ${transactions.length} wallet transactions`);

    // 9. Create partner for user[0]
    console.log('Creating partner...');
    await db.insert(schema.partners).values({
      userId: users[0].id,
      programType: 'affiliate',
      businessName: 'John\'s Health Store',
      businessType: 'Retail',
      commissionRate: '10',
      totalSales: '5000',
      status: 'active',
    });
    console.log('✓ Created partner');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${adminUsers.length} admin users (admin@pharmacy.com / admin123)`);
    console.log(`- ${categoriesData.length} categories`);
    console.log(`- ${products.length} products`);
    console.log(`- ${users.length} users (password: password123)`);
    console.log(`- ${vouchers.length} vouchers`);
    console.log(`- ${paymentAccounts.length} payment accounts`);
    console.log(`- ${orders.length} sample orders`);
    console.log(`- ${transactions.length} wallet transactions`);
    console.log('\n💡 Login credentials:');
    console.log('Admin: admin@pharmacy.com / admin123');
    console.log('User: john@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✨ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed:', error);
    process.exit(1);
  });
