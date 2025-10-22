# Debug Steps for API Issues

## Step 1: Check if server is running
```bash
# Make sure server is running on port 5000
pnpm start
```

## Step 2: Test database connection
Visit: http://localhost:5000/api/test-db

## Step 3: Check environment variables
Can you confirm these are set in your .env file:
- DATABASE_URL (should start with postgresql://)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Step 4: Push database schema
```bash
pnpm db:push
```

## Step 5: Seed database with data
```bash
pnpm db:seed
```

## Step 6: Test admin API with authentication
The admin APIs require authentication. You need to:
1. Login as admin first
2. Or test without middleware

## Common Issues:
1. **Database not connected** - Check DATABASE_URL
2. **Tables don't exist** - Run `pnpm db:push`
3. **No data in tables** - Run `pnpm db:seed`
4. **Authentication failing** - Admin cookies not set

## Quick Test:
Try accessing: http://localhost:5000/api/test-db
This will show database status without authentication.
