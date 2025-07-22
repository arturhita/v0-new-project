-- This script is for diagnostic purposes only and does not modify any data.
-- Please run this script and share the output.

DO $$
DECLARE
    -- Section 1: Function and Trigger Checks
    handle_new_user_exists BOOLEAN;
    get_profile_bypass_exists BOOLEAN;
    get_profile_direct_exists BOOLEAN;

    -- Section 2: RLS Policy Checks
    profiles_select_policy_exists BOOLEAN;
    profiles_update_policy_exists BOOLEAN;
    
    -- Section 3: Output
    report TEXT := '--- Auth System Diagnostic Report ---';
BEGIN
    -- Section 1: Check for essential functions and triggers
    report := report || E'\n\n--- Section 1: Functions & Triggers ---';

    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) INTO handle_new_user_exists;
    IF handle_new_user_exists THEN
        report := report || E'\n[OK] Trigger "on_auth_user_created" exists.';
    ELSE
        report := report || E'\n[FAIL] Trigger "on_auth_user_created" is MISSING. This is critical for profile creation.';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'get_profile_bypass'
    ) INTO get_profile_bypass_exists;
    IF get_profile_bypass_exists THEN
        report := report || E'\n[OK] Function "get_profile_bypass" exists.';
    ELSE
        report := report || E'\n[FAIL] Function "get_profile_bypass" is MISSING. The app relies on this for fetching profiles.';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'get_profile_direct'
    ) INTO get_profile_direct_exists;
    IF get_profile_direct_exists THEN
        report := report || E'\n[OK] Function "get_profile_direct" exists.';
    ELSE
        report := report || E'\n[FAIL] Function "get_profile_direct" is MISSING. This is a fallback for fetching profiles.';
    END IF;

    -- Section 2: Check for RLS policies on 'profiles' table
    report := report || E'\n\n--- Section 2: Row Level Security (RLS) on `profiles` table ---';

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity) THEN
        report := report || E'\n[OK] RLS is enabled on the `profiles` table.';

        SELECT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view their own profile.'
        ) INTO profiles_select_policy_exists;
        IF profiles_select_policy_exists THEN
            report := report || E'\n[OK] RLS policy "Users can view their own profile." for SELECT exists.';
        ELSE
            report := report || E'\n[WARN] RLS policy for SELECT on profiles seems to be missing or named differently. This could cause issues.';
        END IF;

        SELECT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile.'
        ) INTO profiles_update_policy_exists;
        IF profiles_update_policy_exists THEN
            report := report || E'\n[OK] RLS policy "Users can update their own profile." for UPDATE exists.';
        ELSE
            report := report || E'\n[WARN] RLS policy for UPDATE on profiles seems to be missing or named differently.';
        END IF;
    ELSE
        report := report || E'\n[FAIL] RLS is NOT enabled on the `profiles` table. This is a major security risk and can cause auth failures.';
    END IF;

    report := report || E'\n\n--- End of Report ---';

    -- Raise notice with the final report
    RAISE NOTICE '%', report;
END $$;
