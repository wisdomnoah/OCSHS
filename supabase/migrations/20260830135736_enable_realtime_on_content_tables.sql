/*
# Enable realtime on all content tables

## Overview
The `supabase_realtime` publication currently has zero tables, so the
frontend's `supabase.channel(...).on('postgres_changes', ...)` subscriptions
never fire — admin edits would require a manual page refresh to appear on the
public site. This adds every content table to the publication so INSERT /
UPDATE / DELETE events stream to all connected clients in real time.

## Changes
- Adds announcements, events, gallery_items, awards, staff, programs,
  timeline_milestones, and contact_messages to the `supabase_realtime`
  publication via `ALTER PUBLICATION ... ADD TABLE`.
- No schema, policy, or data changes. Fully idempotent: re-running is a no-op
  because the tables are only added if not already present (guarded by a DO
  block that checks `pg_publication_tables` first).
*/

DO $$
DECLARE
  t text;
  pub text := 'supabase_realtime';
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'announcements','events','gallery_items','awards',
    'staff','programs','timeline_milestones','contact_messages'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = pub AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION %I ADD TABLE public.%I;', pub, t);
    END IF;
  END LOOP;
END $$;
