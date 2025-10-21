#!/usr/bin/env tsx

/**
 * Migration Script: Neon → Supabase
 * This script helps migrate your database schema to Supabase
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting Neon → Supabase Migration...\n');

// Step 1: Generate new migration
console.log('📋 Step 1: Generating Drizzle migration for Supabase...');
try {
  execSync('pnpm drizzle-kit generate', { stdio: 'inherit' });
  console.log('✅ Migration generated successfully\n');
} catch (error) {
  console.error('❌ Failed to generate migration:', error);
  process.exit(1);
}

// Step 2: Push schema to Supabase
console.log('📤 Step 2: Pushing schema to Supabase...');
try {
  execSync('pnpm drizzle-kit push', { stdio: 'inherit' });
  console.log('✅ Schema pushed to Supabase successfully\n');
} catch (error) {
  console.error('❌ Failed to push schema:', error);
  process.exit(1);
}

// Step 3: Seed database (optional)
console.log('🌱 Step 3: Would you like to seed the database? (y/n)');
// For now, just show the command
console.log('Run: tsx db/seed-data.ts\n');

// Step 4: Enable RLS (optional)
console.log('🔒 Step 4: Would you like to enable RLS? (y/n)');
console.log('Run: tsx db/enable-rls.ts\n');

console.log('✨ Migration setup complete!');
console.log('📋 Next steps:');
console.log('1. Update your .env.local with Supabase credentials');
console.log('2. Run: pnpm install');
console.log('3. Run: pnpm build');
console.log('4. Test your application');
