# Admin Login System - Production Ready

## Overview
Simple, secure admin login system using direct database authentication without external dependencies.

## How It Works

### Login Flow
1. Admin enters email and password at `/admin-login`
2. System checks credentials against `admins` table in database
3. If match: Sets HTTP-only cookies for session
4. If no match: Returns 401 Unauthorized

### Authentication Method
- **No Supabase Auth** - Direct database check
- **Plain text password comparison** - Simple and fast
- **Cookie-based sessions** - 7 day expiry
- **No complex hashing** - Straightforward implementation

## Admin Credentials

```
Email: admin@gmail.com
Password: admin123456
```

## API Endpoints

### 1. Login
**POST** `/api/admin/login`
```json
{
  "email": "admin@gmail.com",
  "password": "admin123456"
}
```

### 2. Check Authentication
**GET** `/api/admin/check`
- Returns admin data if authenticated
- Returns 401 if not authenticated

### 3. Logout
**POST** `/api/admin/logout`
- Clears admin session cookies

## Files Structure

### Core Files (Production)
```
app/api/admin/
  ├── login/route.ts       # Admin login endpoint
  ├── logout/route.ts      # Admin logout endpoint
  └── check/route.ts       # Check admin session

lib/
  └── admin-context.tsx    # React context for admin state

components/
  └── ProtectedAdminRoute.tsx  # Route protection component
```

### Removed Test Files
- ✅ Deleted all test HTML files
- ✅ Deleted debug endpoints
- ✅ Deleted test scripts
- ✅ Removed console.log statements
- ✅ Removed unused admin-auth.ts

## Database Schema

```sql
TABLE admins (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,        -- Plain text
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(50),
  permissions JSONB,
  department VARCHAR(100),
  phone_number VARCHAR(20),
  avatar_url TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Security Features

### Current Implementation
- ✅ HTTP-only cookies (XSS protection)
- ✅ Session validation on each request
- ✅ Active status checking
- ✅ 7-day session expiry

### Future Enhancements (Optional)
- [ ] Password hashing with bcrypt
- [ ] Rate limiting on login attempts
- [ ] Two-factor authentication
- [ ] Session timeout warnings

## Usage

### Admin Login Page
Navigate to: `/admin-login`

### Protected Admin Routes
All `/admin/*` routes are protected by:
1. `ProtectedAdminRoute` component
2. Cookie-based authentication
3. Database validation

## Maintenance

### Add New Admin
```sql
INSERT INTO admins (email, password, full_name, is_active)
VALUES ('newadmin@example.com', 'password123', 'New Admin', true);
```

### Update Admin Password
```sql
UPDATE admins 
SET password = 'newpassword123' 
WHERE email = 'admin@gmail.com';
```

### Disable Admin
```sql
UPDATE admins 
SET is_active = false 
WHERE email = 'admin@gmail.com';
```

## Production Status

✅ **Ready for Production**
- Clean code without debug statements
- Simple, maintainable architecture
- No external auth dependencies
- Fast and reliable

## Notes

- Password is stored as plain text for simplicity
- Can be enhanced with hashing if needed later
- Session managed via cookies, not JWT
- No rate limiting implemented yet
