/*
# Add contact_messages table for the public contact form

## Overview
The Contact page lets visitors send messages. Previously the form attempted to
insert into `announcements`, which is write-locked to authenticated admins —
so visitor submissions silently failed. This adds a dedicated table that
accepts anonymous inserts but keeps messages private (anon can only insert,
never read; only authenticated admins can read).

## New Tables
- contact_messages — name, email, subject, message, created_at

## Security
- RLS enabled.
- SELECT/UPDATE/DELETE: authenticated only (admin can review and clear messages).
- INSERT: anon + authenticated (anyone can submit a message).
- anon cannot read messages back (no SELECT policy for anon) — submissions are write-only for visitors.
*/
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT 'General Inquiry',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_submit_contact" ON contact_messages;
CREATE POLICY "public_submit_contact" ON contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_contact" ON contact_messages;
CREATE POLICY "admin_read_contact" ON contact_messages
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_contact" ON contact_messages;
CREATE POLICY "admin_update_contact" ON contact_messages
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_contact" ON contact_messages;
CREATE POLICY "admin_delete_contact" ON contact_messages
  FOR DELETE TO authenticated USING (true);
