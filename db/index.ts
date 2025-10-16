import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

neonConfig.fetchConnectionCache = true;

neonConfig.poolQueryViaFetch = true;

neonConfig.pipelineConnect = false;

neonConfig.types = {
  ...(neonConfig.types || {}),
};

if (!neonConfig.types.uuid) {
  neonConfig.types.uuid = {
    to: 2950,
    from: [2950],
    serialize: (value: any) => value,
    parse: (value: any) => {
      if (value instanceof Uint8Array || Array.isArray(value)) {
        const hex = Array.from(value as number[])
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }
      return value;
    }
  };
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
