# MythicHub — Expo Go MVP
Unofficial MLBB community companion. Not affiliated with MOONTON.

## Run
1. Install Node.js LTS, Expo Go, and dependencies: `npm install`.
2. Create a Supabase project. In SQL Editor run `supabase/schema.sql`.
3. Copy `.env.example` to `.env`; fill in the project URL and **publishable/anon** key. Never use a service-role key in the app.
4. Enable Email provider in Supabase Authentication and configure email confirmation as desired.
5. Run `npx expo start --clear` and scan the QR with Expo Go.

## What works
- Real Supabase email/password signup, login, session persistence, logout.
- Private player ID, server ID and optional nickname saved with per-user row-level security.
- Form validation, safe-area friendly scrolling, and offline-friendly error states.

## Not yet supported
- MLBB nickname lookup, verification of game account ownership, automatic skin detection, collection/community features. Those need an authorized provider or later development.
- Password reset and account deletion UX are next milestones.

## Security
Player IDs are unverified claims. Do not ask users for their MLBB password, OTP or account recovery codes. Identifiers are private by default.
