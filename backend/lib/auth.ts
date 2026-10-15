import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './schema';
export const auth = betterAuth({ database: drizzleAdapter(db,{provider:'pg',schema}), emailAndPassword:{enabled:true,minPasswordLength:8}, trustedOrigins:[process.env.BETTER_AUTH_URL ?? 'http://localhost:3000', 'mythichub://'], secret:process.env.BETTER_AUTH_SECRET, baseURL:process.env.BETTER_AUTH_URL });
