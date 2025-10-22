# Admin Authentication Migration

## Overview
Successfully migrated admin authentication system from Supabase Auth to custom authentication using the existing `admins` table.

## Changes Made

### 1. Database Schema
- ✅ **No changes needed** - `admins` table already has:
  - `id` (UUID primary key)
  - `email` (unique)
  - `password` (hashed)
  - `fullName`
  - `isActive`
  - `lastLogin`
  - `createdAt`

### 2. Backend Authentication

#### Updated Files:
- **`lib/admin-auth.ts`** - Custom admin authentication using cookies
- **`app/api/admin/login/route.ts`** - Sets admin cookies on successful login
- **`app/api/admin/logout/route.ts`** - Clears admin cookies
- **`app/api/admin/check/route.ts`** - Validates admin session using custom auth

#### Authentication Flow:
1. Admin logs in with email/password
2. System validates credentials against `admins` table
3. Sets secure HTTP-only cookies (`admin-id`, `admin-email`)
4. Subsequent requests validated using cookies + database lookup

### 3. Frontend Changes

#### New Files:
- **`lib/admin-context.tsx`** - React context for admin authentication
- **`components/ProtectedAdminRoute.tsx`** - Updated to use custom auth

#### Features:
- Custom admin login/logout
- Session persistence via cookies
- Loading states
- Error handling

### 4. Admin Creation Script
- **`scripts/create-admin.ts`** - Script to create initial admin user

## How to Use

### 1. Create Admin User
```bash
# Run the admin creation script
npx tsx scripts/create-admin.ts
```

Default credentials:
- Email: `admin@medicine-website.com`
- Password: `admin123456`

### 2. Login Process
1. Go to `/admin-login`
2. Enter admin email and password
3. System validates against `admins` table
4. On success, redirects to admin dashboard

### 3. Session Management
- Sessions persist for 7 days via HTTP-only cookies
- Automatic logout on invalid/expired sessions
- Manual logout clears all admin cookies

## Security Features

### Authentication
- ✅ Password hashing with bcrypt
- ✅ HTTP-only cookies (XSS protection)
- ✅ Secure cookies in production
- ✅ SameSite protection (CSRF protection)
- ✅ Database validation on each request

### Authorization
- ✅ Admin-only routes protected
- ✅ Active status checking
- ✅ Email verification on each request

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout  
- `GET /api/admin/check` - Check admin session

### Protected Admin Routes
All `/api/admin/*` routes now use `checkAdminAuth()` for protection.

## Migration Benefits

### Before (Supabase Auth)
- ❌ Dependency on external service
- ❌ Complex user metadata management
- ❌ Potential service outages
- ❌ Additional API calls

### After (Custom Auth)
- ✅ Full control over authentication
- ✅ Direct database integration
- ✅ Simplified admin management
- ✅ Better performance (no external calls)
- ✅ Custom session management

## Testing

### Manual Testing Steps
1. **Create Admin**: Run creation script
2. **Login**: Test login with correct credentials
3. **Invalid Login**: Test with wrong credentials
4. **Session Persistence**: Refresh page, should stay logged in
5. **Logout**: Test logout functionality
6. **Protected Routes**: Access admin routes without login (should redirect)

### Test Credentials
```
Email: admin@medicine-website.com
Password: admin123456
```

## Troubleshooting

### Common Issues
1. **"Admin not found"** - Run admin creation script
2. **"Invalid credentials"** - Check email/password
3. **"Not authenticated"** - Clear browser cookies and login again
4. **Database errors** - Check database connection

### Debug Steps
1. Check browser cookies (`admin-id`, `admin-email`)
2. Verify admin exists in database
3. Check server logs for authentication errors
4. Ensure `isActive` is true for admin user

## Future Enhancements

### Security
- [ ] Add rate limiting to login endpoint
- [ ] Implement password complexity requirements
- [ ] Add 2FA support
- [ ] Session timeout warnings

### Features
- [ ] Multiple admin roles
- [ ] Admin activity logging
- [ ] Password reset functionality
- [ ] Admin user management UI

## Environment Variables
Make sure to set:
```env
# Optional: Custom JWT secret (currently using simple cookies)
JWT_SECRET=your-secure-secret-key
```
