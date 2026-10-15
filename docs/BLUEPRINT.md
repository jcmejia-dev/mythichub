# MythicHub — Product and Technical Blueprint v1.0

> Unofficial Mobile Legends: Bang Bang community companion. Not affiliated with or endorsed by MOONTON.

## Product vision
A mobile-first home for MLBB players to track skin ownership, pursue collecting goals, manage premium event progress, plan diamond expenses and share opt-in public profiles.

## Design system
- Primary background: #0B1224
- Surface: #17253E
- Elevated surface: #253B5F
- Gold accent: #EAC67D
- Electric blue: #7AC8FF
- Primary text: #FFFFFF
- Muted text: #AAB9CE
- Rounded cards (16–22dp), generous spacing, safe-area aware navigation.
- Avoid copying the game's copyrighted logos/UI and never imply official sponsorship.
- Accessibility: readable contrast, dynamic text, 44px+ tap targets, reduced-motion support.

## MVP experience
1. **Home**: overview of tracking goals, featured skins, current savings.
2. **Skins**: searchable categorized catalog; mark owned/wishlist/target. Metadata is curated and versioned.
3. **Tracker**: Magic Wheel progress (0–200), potions, diamonds, draw pricing, weekly-reward settings, budget and estimated finish. Rules user-editable and time-stamped; distinguish guarantees from odds.
4. **Community**: opt-in shareable profile and collection showcase; no fake social feed or fabricated users. Begin with a shareable local snapshot, then backend.
5. **Profile**: nickname, optional MLBB ID (private by default), preferences, privacy controls, export/delete data.

## Navigation
Expo Router tabs with Home, Skins, Tracker, Community, Profile. Dedicated skin detail and settings routes.

## MVP engineering
- Expo / React Native / TypeScript / Expo Router.
- Use current Expo-Go-compatible SDK on initialization.
- State: lightweight store with clear domain types; AsyncStorage for local persistence (non-secret only).
- Secure credentials in expo-secure-store, after real authentication is introduced.
- Event rules in typed, versioned configuration; do not bake uncertain drop rates into formulas.
- Supabase planned for authentication, Postgres tables, row-level security and opt-in public profiles. Do not expose service role key to client.
- Start with Expo Go compatible libraries; EAS development build needed for unsupported native modules later.
- Keep secrets out of git, ship .env.example only.

## Domain model
UserProfile(id, handle, avatar, privacy, gameIdOptional)
Skin(id, hero, name, category, eventType, artworkLicense)
UserSkin(userId, skinId, status, acquiredAt)
Tracker(id, userId, eventType, progress, goal, inventory, ruleVersion)
Budget(userId, currency, weeklyLimit)
RuleConfig(id, version, effectiveDate, drawCost, batchCost, weeklyThresholds, drawGuarantee)

## Delivery roadmap
### Phase 0 — foundation
Expo app shell, theme tokens, tabs, navigation, onboarding, mock data, local storage.
### Phase 1 — usable tracker
Skin catalog/collection, Magic Wheel tracking, budget planner, editable event assumptions, import/export.
### Phase 2 — actual community
Supabase auth, row-level security, public profiles, collection sharing, reporting/blocking and moderation.
### Phase 3 — extended events
Other skin draw trackers, event calendar, notifications, optional OCR with user confirmation.

## Acceptance criteria
- Expo Go launches on Android; no broken imports, tab overlap, or unsafe-area clipping.
- Data persists after restart and can be exported.
- Magic Wheel calculation checks 0/200, 130/200, and 200/200 states; no misleading guaranteed cheaper price.
- Public profile sharing is opt-in and excludes game ID by default.
- No credentials in git; typecheck and lint pass.
- Tested at narrow Android sizes and with font scaling.

## Launch boundaries
No automatic account syncing without an authorized integration. No gambling-oriented nudges or pressure to recharge. No claim of official MLBB partnership.
