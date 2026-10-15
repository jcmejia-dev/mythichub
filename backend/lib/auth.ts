import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { db } from './db';
import * as schema from './schema';
export const auth = betterAuth({database:drizzleAdapter(db,{provider:'pg',schema}),emailAndPassword:{enabled:true,minPasswordLength:8},plugins:[bearer()],trustedOrigins:[process.env.BETTER_AUTH_URL??'http://localhost:3000','http://localhost:8081','http://127.0.0.1:8081','mythichub://',...(process.env.EXPO_WEB_ORIGIN?[process.env.EXPO_WEB_ORIGIN]:[])],secret:process.env.BETTER_AUTH_SECRET,baseURL:process.env.BETTER_AUTH_URL});
