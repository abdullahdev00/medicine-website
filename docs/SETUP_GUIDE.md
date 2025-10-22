# Medicine Website Setup Guide

## 🚀 Quick Setup Steps

### 1. Configure Environment Variables
Edit the `.env.local` file with your actual Supabase credentials:

```env
# Get these from your Supabase project dashboard
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

### 2. Push Database Schema
```bash
pnpm db:push
```

### 3. Seed Database with Sample Data
```bash
pnpm db:seed
```

### 4. Start the Application
```bash
pnpm dev
```

## 🔑 Login Credentials (After Seeding)

### Admin Panel
- **Email:** admin@pharmacy.com
- **Password:** admin123

### User Accounts
- **Email:** john@example.com, sarah@example.com, ali@example.com
- **Password:** password123

## 🗄️ Database Tables Created
- ✅ Admins (2 admin users)
- ✅ Categories (9 categories)
- ✅ Products (18+ products)
- ✅ Users (5 demo users with referrals)
- ✅ Orders (3 sample orders)
- ✅ Partners (1 affiliate partner)
- ✅ Payment accounts
- ✅ Vouchers
- ✅ Wallet transactions

## 🔧 Troubleshooting

### If APIs still return errors:
1. Check if DATABASE_URL is correctly set
2. Verify Supabase project is active
3. Ensure database schema is pushed
4. Check if sample data is seeded

### Common Issues:
- **"column does not exist"** → Run `pnpm db:push`
- **"Unauthorized"** → Check admin login cookies
- **"No data"** → Run `pnpm db:seed`
