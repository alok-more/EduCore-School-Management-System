/*
# EduCore — Add unique constraint on profiles.email

## Purpose
Ensures email addresses are unique across all profiles, which is required
for login (findProfileByEmail) and for creating new school admin users.

## Changes
1. Add a unique index on `profiles.email`.
*/

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique
  ON public.profiles (email);
