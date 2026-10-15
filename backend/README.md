# MythicHub Neon + Better Auth API

1. Copy `.env.example` to `.env.local` in this directory. Set your Neon pooled DATABASE_URL and a strong BETTER_AUTH_SECRET. Set BETTER_AUTH_URL to http://localhost:3000 for local use.
2. Run `npm install`, then `npm run db` to create Better Auth and player-profile tables in Neon. Review generated SQL before accepting changes.
3. Run `npm run dev` to start the API listening on your LAN.
4. The Expo app must use EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:3000 (or http://localhost:3000 for web-only on the same PC).
5. In production, set BETTER_AUTH_URL to the HTTPS backend domain, set DATABASE_URL and BETTER_AUTH_SECRET in Vercel's server-only environment, and redeploy.

Never expose DATABASE_URL or BETTER_AUTH_SECRET to the mobile app. Player IDs are manually supplied and are not verified against MLBB. Before production release, add email verification, password recovery, rate limiting, and privacy controls.
