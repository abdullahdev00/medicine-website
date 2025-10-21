import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required - Please check your .env file');
}

console.log('🌐 Connecting to Supabase database...');
console.log('Database URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

// Check if DATABASE_URL contains placeholder values
if (process.env.DATABASE_URL.includes('[YOUR-PASSWORD]') || process.env.DATABASE_URL.includes('[YOUR-')) {
  console.error('❌ DATABASE_URL contains placeholder values. Please update your .env file with actual credentials.');
  throw new Error('DATABASE_URL contains placeholder values - Please update your .env file');
}

let client: postgres.Sql;

try {
  // Supabase connection with proper configuration
  client = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    max: 10,
    connection: {
      options: `--search_path=public`,
    },
    // Longer timeout for better stability
    connect_timeout: 30,
    idle_timeout: 60,
    // Better error handling
    onnotice: () => {}, // Ignore notices
    debug: false,
    // Add retry logic
    max_lifetime: 60 * 30, // 30 minutes
    transform: {
      undefined: null,
    },
  });

  // Test the connection
  client`SELECT 1`.then(() => {
    console.log('✅ Database connection successful');
  }).catch((error) => {
    console.error('❌ Database connection failed:', error.message);
  });

} catch (error) {
  console.error('❌ Failed to create database client:', error);
  throw error;
}

export const db = drizzle(client, { schema });
