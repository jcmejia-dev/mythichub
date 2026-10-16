-- Non-destructive migration for MythicHub collections and goal tracking.
-- Run once in the existing Neon database SQL Editor.
-- Does not modify any existing profile, user, auth or lookup data.
CREATE TABLE IF NOT EXISTS player_tracker (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp NOT NULL DEFAULT NOW()
);
