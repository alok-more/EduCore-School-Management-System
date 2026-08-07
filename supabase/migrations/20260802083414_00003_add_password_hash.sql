/*
# EduCore — Add password_hash column for JWT/bcrypt auth

## Purpose
Migrates from Supabase Auth to standalone JWT + bcrypt authentication.
Adds a `password_hash` column to the `profiles` table so user credentials are
stored directly (bcrypt-hashed), and removes the foreign key constraint to
`auth.users` so profiles are no longer dependent on Supabase's auth system.

## Changes
1. Add `password_hash` (varchar 255, not null) to `profiles`.
2. Drop the FK constraint `profiles_id_fkey` (profiles.id -> auth.users.id).
3. Backfill `password_hash` for existing seed profiles with bcrypt hashes.

## Notes
1. The `id` column on profiles is now a plain UUID primary key (no longer
   references auth.users). New profiles get `gen_random_uuid()` defaults.
2. Password hashes were generated with bcrypt (10 rounds).
*/

-- Step 1: Add password_hash column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_hash varchar(255);

-- Step 2: Drop the FK to auth.users so profiles is standalone
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 3: Change the primary key default to gen_random_uuid() since it's no longer FK'd
ALTER TABLE public.profiles
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Step 4: Backfill password_hash for existing seed profiles
UPDATE public.profiles SET password_hash = '$2a$10$SbmPuogQme64JeTSczAZu..MnGeFbMrCc6z/m1K0DcCRUw2ZpBj2u'
WHERE email = 'superadmin@educore.test';

UPDATE public.profiles SET password_hash = '$2a$10$ZPeoEWQPSb2rfQwB/qBZPe/oEsB47ulr58tLmxA0LfEFvN7qDZfEu'
WHERE email = 'admin@maplewood.test';

UPDATE public.profiles SET password_hash = '$2a$10$WJD6OSHtnEoXcY73kJ6kEeg1Kf6MCl.IqbQxW2qXdusO15zns0JLe'
WHERE email = 'admin@sunrise.test';

-- Step 5: Make password_hash NOT NULL now that all rows have values
ALTER TABLE public.profiles
  ALTER COLUMN password_hash SET NOT NULL;
