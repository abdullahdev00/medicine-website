# Database Seed Summary - MediSwift

## ✅ Database Successfully Seeded

The database has been populated with comprehensive demo data for testing and development.

---

## 🔐 Login Credentials

### Admin User
- **Email:** admin@example.com
- **Password:** admin123
- **Access:** Full admin dashboard access

### Test User (Customer)
- **Email:** test@example.com
- **Password:** test123
- **Affiliate Code:** TEST2024
- **Wallet Balance:** Rs. 5,000.00
- **Total Earnings:** Rs. 2,500.00
- **Pending Earnings:** Rs. 500.00
- **Partner Status:** Active Partner

### Partner User
- **Email:** partner@example.com
- **Password:** partner123
- **Affiliate Code:** PARTNER2024
- **Wallet Balance:** Rs. 10,000.00
- **Total Earnings:** Rs. 5,000.00
- **Pending Earnings:** Rs. 1,000.00
- **Partner Status:** Active Partner

---

## 📦 Demo Data Created

### Categories (6 total)
1. Pain Relief
2. Vitamins & Supplements
3. Cold & Flu
4. Diabetes Care
5. First Aid
6. Personal Care

### Products (12 total with variants)
1. **Panadol Extra** - Pain Relief (3 variants: 10/20/30 Tablets)
2. **Brufen 400mg** - Pain Relief (2 variants: 10/20 Tablets)
3. **Multivitamin Complex** - Vitamins & Supplements (3 variants: 30/60/90 Capsules)
4. **Vitamin D3 5000 IU** - Vitamins & Supplements (2 variants: 30/60 Tablets)
5. **Cold Relief Syrup** - Cold & Flu (2 variants: 60ml/120ml)
6. **Antihistamine Tablets** - Cold & Flu (2 variants: 10/20 Tablets)
7. **Blood Glucose Monitor Kit** - Diabetes Care (2 variants: 50/100 Strips)
8. **Insulin Syringes 1ml** - Diabetes Care (2 variants: 10/30 Pack)
9. **First Aid Kit Complete** - First Aid (2 variants: Basic/Premium)
10. **Antiseptic Solution** - First Aid (2 variants: 100ml/250ml)
11. **Hand Sanitizer** - Personal Care (2 variants: 250ml/500ml)
12. **Face Masks** - Personal Care (2 variants: 50/100 Pack)

### Addresses (3 for test user)
1. **Home** (Default) - House 123, Street 5, F-8, Islamabad
2. **Office** - Office 456, Blue Area, Islamabad
3. **Parents Home** - House 789, G-11/2, Islamabad

### Wishlist Items (4 items)
- Brufen 400mg
- Cold Relief Syrup
- Blood Glucose Monitor Kit
- Face Masks

### Orders (5 orders with different statuses)
1. **Delivered** - Panadol Extra (Rs. 280) - Cash on Delivery
2. **Delivered** - Multivitamin + Vitamin D3 (Rs. 1,500) - Wallet Payment
3. **Shipped** - First Aid Kit (Rs. 1,200) - Cash on Delivery
4. **Processing** - Hand Sanitizer x3 (Rs. 1,650) - Wallet Payment
5. **Pending** - Cold Relief Syrup (Rs. 220) - Cash on Delivery

### Wallet Transactions (7 transactions)
1. Credit: Rs. 2,000 - Welcome bonus
2. Credit: Rs. 500 - Affiliate commission
3. Debit: Rs. 500 - Payment for order
4. Credit: Rs. 1,500 - Referral bonus (3 successful referrals)
5. Debit: Rs. 1,000 - Payment for order
6. Credit: Rs. 1,500 - Top-up via bank transfer
7. Credit: Rs. 500 - Partner commission (pending)

### Partners (1 active partner)
- **Business Name:** MediCare Pharmacy
- **Business Type:** Pharmacy
- **Commission Rate:** 15%
- **Total Sales:** Rs. 25,000
- **Status:** Active

### Referral Stats
- **Total Referrals:** 5 users
- **Total Orders from Referrals:** 12
- **Total Commission Earned:** Rs. 2,500

### Payment Accounts (3 system accounts)
1. **JazzCash** - MediSwift Operations (03001234567)
2. **EasyPaisa** - MediSwift Operations (03001234567)
3. **Raast ID** - MediSwift Operations (mediswift@raast)

### User Payment Accounts (2 accounts)
1. **Test User** - testuser@raast (Default)
2. **Partner User** - partner@raast (Default)

---

## 💳 Payment Requests (5 requests with various statuses)

### 1. Pending Deposit Request
- **User:** Test User
- **Type:** Deposit
- **Amount:** Rs. 5,000
- **Method:** JazzCash
- **Status:** Pending
- **Receipt:** Included

### 2. Approved Withdrawal Request
- **User:** Test User
- **Type:** Withdrawal
- **Amount:** Rs. 2,000
- **Method:** Raast ID
- **Status:** Approved
- **Admin Notes:** "Approved by admin"

### 3. Pending Deposit Request
- **User:** Partner User
- **Type:** Deposit
- **Amount:** Rs. 3,000
- **Method:** EasyPaisa
- **Status:** Pending
- **Receipt:** Included

### 4. Rejected Withdrawal Request
- **User:** Partner User
- **Type:** Withdrawal
- **Amount:** Rs. 1,500
- **Method:** Raast ID
- **Status:** Rejected
- **Rejection Reason:** "Insufficient balance"
- **Admin Notes:** "User has insufficient balance for withdrawal"

### 5. Approved Deposit Request
- **User:** Test User
- **Type:** Deposit
- **Amount:** Rs. 10,000
- **Method:** JazzCash
- **Status:** Approved
- **Admin Notes:** "Verified and approved"

---

## 🎯 Testing Scenarios Available

### Customer Flow
1. Login as test user
2. Browse products by category
3. Add items to wishlist
4. View saved addresses
5. Check order history (multiple statuses)
6. View wallet balance and transactions
7. See affiliate/referral stats
8. Submit payment requests (deposit/withdrawal)

### Partner Flow
1. Login as partner user
2. View partner dashboard
3. Check commission earnings
4. View sales statistics
5. Manage payment requests

### Admin Flow
1. Login as admin user
2. View all payment requests
3. Approve/reject deposit requests
4. Process withdrawal requests
5. Add admin notes
6. Monitor user activities

---

## 📝 Notes

- All passwords are hashed using bcrypt
- Affiliate codes are unique for each user
- Payment requests demonstrate all possible statuses: pending, approved, rejected
- Orders demonstrate various statuses: pending, processing, shipped, delivered
- Wallet transactions are properly linked to orders
- All timestamps are properly set relative to current date

---

## 🚀 Next Steps

You can now:
1. Test the application with any of the three user accounts
2. Verify the admin dashboard functionality
3. Test payment request workflows
4. Explore the complete customer journey
5. Validate all features with realistic demo data

All data is ready for development and testing!
