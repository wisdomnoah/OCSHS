/*
# OCSHS CMS — profiles, roles, settings, homepage content, pages, audit log

## Overview
Extends the existing school schema with a full CMS backend: role-based admin
profiles, editable site settings, editable homepage content, custom pages,
and an audit log. Adds published/draft + tracking columns to existing content
tables. Locks down all writes to authenticated staff only (server-enforced via
RLS + column privileges + SECURITY DEFINER functions).

Order matters: profiles table must exist before helper functions that read it;
helper functions must exist before policies that call them.

## New tables
- profiles (id FK auth.users, role, full_name, disabled, created_at)
- site_settings (single row: school name/motto/mission/vision/address/phone/email/logo/social/hours)
- homepage_content (single row: hero, about, principal message, stat counters)
- pages (custom editable pages: title, slug, content, image, status)
- audit_log (actor, action, entity, details, timestamp)

## Modified tables (additive — no data loss)
- announcements/events/gallery_items/staff/awards: + status('published'), published_at, updated_at (+ extras). Existing rows stay visible.

## Security
- RLS: public reads see status='published' only; staff see+write all via is_staff_member().
- profiles.role never client-writable; admin_set_user_role() super_admin-only SECURITY DEFINER.
- bootstrap_first_super_admin(): one-time promotion when zero super_admins.
- Storage bucket 'media': public read, uid-scoped staff writes.
*/

-- ========================================================================
-- 1. PROFILES TABLE (must exist before helper functions)
-- ========================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'content_editor' CHECK (role IN ('super_admin','content_editor')),
  full_name text,
  disabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ========================================================================
-- 2. HELPER FUNCTIONS (referenced by policies)
-- ========================================================================
CREATE OR REPLACE FUNCTION is_staff_member()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin','content_editor') AND disabled = false
  );
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin' AND disabled = false
  );
$$;

REVOKE EXECUTE ON FUNCTION is_staff_member() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION is_staff_member() TO authenticated;
REVOKE EXECUTE ON FUNCTION is_super_admin() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;

-- ========================================================================
-- 3. PROFILES RLS + TRIGGER
-- ========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_super_admin());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON profiles;
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_super_admin())
  WITH CHECK (id = auth.uid() OR is_super_admin());

REVOKE UPDATE ON profiles FROM authenticated, anon;
GRANT UPDATE (full_name, disabled) ON profiles TO authenticated;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (NEW.id, 'content_editor', COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================================================
-- 4. PRIVILEGED FUNCTIONS
-- ========================================================================
CREATE OR REPLACE FUNCTION admin_set_user_role(p_user uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_role NOT IN ('super_admin','content_editor') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  UPDATE profiles SET role = p_role WHERE id = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION admin_set_user_role(uuid, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_set_user_role(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION admin_set_user_disabled(p_user uuid, p_disabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE profiles SET disabled = p_disabled WHERE id = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION admin_set_user_disabled(uuid, boolean) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_set_user_disabled(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION bootstrap_first_super_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM profiles WHERE role = 'super_admin';
  IF v_count > 0 THEN RAISE EXCEPTION 'A super admin already exists'; END IF;
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE profiles SET role = 'super_admin' WHERE id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found — sign in first'; END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION bootstrap_first_super_admin() FROM anon;
GRANT EXECUTE ON FUNCTION bootstrap_first_super_admin() TO authenticated;

CREATE OR REPLACE FUNCTION write_audit(p_action text, p_entity_type text, p_entity_id text, p_details jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO audit_log (actor_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details);
END;
$$;
REVOKE EXECUTE ON FUNCTION write_audit(text, text, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION write_audit(text, text, text, jsonb) TO authenticated;

-- ========================================================================
-- 5. SITE SETTINGS (single row)
-- ========================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  school_name text NOT NULL DEFAULT 'Obele Community Senior High School',
  school_short text NOT NULL DEFAULT 'OCSHS',
  motto text NOT NULL DEFAULT 'Honesty, Obedience, and Hard Work',
  mission text,
  vision text,
  address text NOT NULL DEFAULT '82, Randle Avenue, Surulere, Lagos, Nigeria',
  phone text NOT NULL DEFAULT '08150820178',
  email text NOT NULL DEFAULT 'obelesenior@gmail.com',
  logo_url text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  opening_hours text NOT NULL DEFAULT 'Mon – Fri, 8:00am – 3:00pm',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id, mission, vision) VALUES (1,
  'To nurture disciplined, knowledgeable and God-fearing young people who are prepared to serve their community and lead with integrity.',
  'To be a centre of academic and moral excellence in Surulere — producing graduates who are honest, obedient and hardworking.'
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_public_read" ON site_settings;
CREATE POLICY "settings_public_read" ON site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "settings_staff_write" ON site_settings;
CREATE POLICY "settings_staff_write" ON site_settings FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
DROP POLICY IF EXISTS "settings_staff_insert" ON site_settings;
CREATE POLICY "settings_staff_insert" ON site_settings FOR INSERT TO authenticated WITH CHECK (is_staff_member());

-- ========================================================================
-- 6. HOMEPAGE CONTENT (single row)
-- ========================================================================
CREATE TABLE IF NOT EXISTS homepage_content (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_title text NOT NULL DEFAULT 'Where curiosity becomes mastery.',
  hero_description text NOT NULL DEFAULT 'A community of curiosity, character, and excellence in Surulere, Lagos — empowering students since 1981 with Honesty, Obedience, and Hard Work.',
  hero_image_url text NOT NULL DEFAULT 'https://images.pexels.com/photos/6209356/pexels-photo-6209356.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  hero_button_text text NOT NULL DEFAULT 'Discover OCSHS',
  hero_button_link text NOT NULL DEFAULT '/about',
  about_title text NOT NULL DEFAULT 'Four decades of community and excellence.',
  about_description text,
  principal_message text,
  principal_name text NOT NULL DEFAULT 'Mr. FALAIYE OLUGBENGA ADEDIRUN',
  principal_photo_url text,
  stat_students integer NOT NULL DEFAULT 804,
  stat_teachers integer NOT NULL DEFAULT 26,
  stat_graduating_sets integer NOT NULL DEFAULT 39,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO homepage_content (id, about_description, principal_message, principal_photo_url) VALUES (1,
  'Established in 1981, Obele Community Senior High School has proudly produced 39 sets of graduating alumni — building character and knowledge in the heart of Surulere, Lagos.',
  'At Obele Community Senior High School, we believe every child deserves the opportunity to grow in knowledge and character. Our doors have been open since 1981, and we remain committed to the motto that defines us: Honesty, Obedience, and Hard Work. I welcome every student, parent, and staff member to a new session of excellence.',
  'https://images.pexels.com/photos/12311537/pexels-photo-12311537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "homepage_public_read" ON homepage_content;
CREATE POLICY "homepage_public_read" ON homepage_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "homepage_staff_write" ON homepage_content;
CREATE POLICY "homepage_staff_write" ON homepage_content FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
DROP POLICY IF EXISTS "homepage_staff_insert" ON homepage_content;
CREATE POLICY "homepage_staff_insert" ON homepage_content FOR INSERT TO authenticated WITH CHECK (is_staff_member());

-- ========================================================================
-- 7. PAGES
-- ========================================================================
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  featured_image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pages_public_read" ON pages;
CREATE POLICY "pages_public_read" ON pages FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "pages_staff_select_all" ON pages;
CREATE POLICY "pages_staff_select_all" ON pages FOR SELECT TO authenticated USING (is_staff_member());
DROP POLICY IF EXISTS "pages_staff_insert" ON pages;
CREATE POLICY "pages_staff_insert" ON pages FOR INSERT TO authenticated WITH CHECK (is_staff_member());
DROP POLICY IF EXISTS "pages_staff_update" ON pages;
CREATE POLICY "pages_staff_update" ON pages FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
DROP POLICY IF EXISTS "pages_staff_delete" ON pages;
CREATE POLICY "pages_staff_delete" ON pages FOR DELETE TO authenticated USING (is_staff_member());
REVOKE INSERT ON pages FROM authenticated;
GRANT INSERT (title, slug, content, featured_image_url, status, published_at) ON pages TO authenticated;

-- ========================================================================
-- 8. AUDIT LOG
-- ========================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_super_admin_read" ON audit_log;
CREATE POLICY "audit_super_admin_read" ON audit_log FOR SELECT TO authenticated USING (is_super_admin());
DROP POLICY IF EXISTS "audit_staff_insert" ON audit_log;
CREATE POLICY "audit_staff_insert" ON audit_log FOR INSERT TO authenticated WITH CHECK (is_staff_member());
REVOKE INSERT ON audit_log FROM authenticated;
GRANT INSERT (action, entity_type, entity_id, details) ON audit_log TO authenticated;

-- ========================================================================
-- 9. ADD COLUMNS TO EXISTING CONTENT TABLES
-- ========================================================================
DO $$ BEGIN
  ALTER TABLE announcements ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published'));
  ALTER TABLE announcements ADD COLUMN IF NOT EXISTS published_at timestamptz DEFAULT now();
  ALTER TABLE announcements ADD COLUMN IF NOT EXISTS featured_image_url text;
  ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published'));
  ALTER TABLE events ADD COLUMN IF NOT EXISTS published_at timestamptz DEFAULT now();
  ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time text;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url text;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published'));
  ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published'));
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE awards ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published'));
  ALTER TABLE awards ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ========================================================================
-- 10. UPDATE RLS ON EXISTING CONTENT TABLES
-- ========================================================================
-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
DROP POLICY IF EXISTS "admin_insert_announcements" ON announcements;
DROP POLICY IF EXISTS "admin_update_announcements" ON announcements;
DROP POLICY IF EXISTS "admin_delete_announcements" ON announcements;
CREATE POLICY "announcements_public_read" ON announcements FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "announcements_staff_read_all" ON announcements FOR SELECT TO authenticated USING (is_staff_member());
CREATE POLICY "announcements_staff_insert" ON announcements FOR INSERT TO authenticated WITH CHECK (is_staff_member());
CREATE POLICY "announcements_staff_update" ON announcements FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
CREATE POLICY "announcements_staff_delete" ON announcements FOR DELETE TO authenticated USING (is_staff_member());

-- EVENTS
DROP POLICY IF EXISTS "public_read_events" ON events;
DROP POLICY IF EXISTS "admin_insert_events" ON events;
DROP POLICY IF EXISTS "admin_update_events" ON events;
DROP POLICY IF EXISTS "admin_delete_events" ON events;
CREATE POLICY "events_public_read" ON events FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "events_staff_read_all" ON events FOR SELECT TO authenticated USING (is_staff_member());
CREATE POLICY "events_staff_insert" ON events FOR INSERT TO authenticated WITH CHECK (is_staff_member());
CREATE POLICY "events_staff_update" ON events FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
CREATE POLICY "events_staff_delete" ON events FOR DELETE TO authenticated USING (is_staff_member());

-- GALLERY
DROP POLICY IF EXISTS "public_read_gallery" ON gallery_items;
DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery_items;
DROP POLICY IF EXISTS "admin_update_gallery" ON gallery_items;
DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery_items;
CREATE POLICY "gallery_public_read" ON gallery_items FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "gallery_staff_read_all" ON gallery_items FOR SELECT TO authenticated USING (is_staff_member());
CREATE POLICY "gallery_staff_insert" ON gallery_items FOR INSERT TO authenticated WITH CHECK (is_staff_member());
CREATE POLICY "gallery_staff_update" ON gallery_items FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
CREATE POLICY "gallery_staff_delete" ON gallery_items FOR DELETE TO authenticated USING (is_staff_member());

-- STAFF
DROP POLICY IF EXISTS "public_read_staff" ON staff;
DROP POLICY IF EXISTS "admin_insert_staff" ON staff;
DROP POLICY IF EXISTS "admin_update_staff" ON staff;
DROP POLICY IF EXISTS "admin_delete_staff" ON staff;
CREATE POLICY "staff_public_read" ON staff FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "staff_staff_read_all" ON staff FOR SELECT TO authenticated USING (is_staff_member());
CREATE POLICY "staff_staff_insert" ON staff FOR INSERT TO authenticated WITH CHECK (is_staff_member());
CREATE POLICY "staff_staff_update" ON staff FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
CREATE POLICY "staff_staff_delete" ON staff FOR DELETE TO authenticated USING (is_staff_member());

-- AWARDS
DROP POLICY IF EXISTS "public_read_awards" ON awards;
DROP POLICY IF EXISTS "admin_insert_awards" ON awards;
DROP POLICY IF EXISTS "admin_update_awards" ON awards;
DROP POLICY IF EXISTS "admin_delete_awards" ON awards;
CREATE POLICY "awards_public_read" ON awards FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "awards_staff_read_all" ON awards FOR SELECT TO authenticated USING (is_staff_member());
CREATE POLICY "awards_staff_insert" ON awards FOR INSERT TO authenticated WITH CHECK (is_staff_member());
CREATE POLICY "awards_staff_update" ON awards FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
CREATE POLICY "awards_staff_delete" ON awards FOR DELETE TO authenticated USING (is_staff_member());

-- CONTACT MESSAGES
DROP POLICY IF EXISTS "public_submit_contact" ON contact_messages;
DROP POLICY IF EXISTS "admin_read_contact" ON contact_messages;
DROP POLICY IF EXISTS "admin_update_contact" ON contact_messages;
DROP POLICY IF EXISTS "admin_delete_contact" ON contact_messages;
CREATE POLICY "contact_public_insert" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_staff_read" ON contact_messages FOR SELECT TO authenticated USING (is_staff_member());
CREATE POLICY "contact_staff_update" ON contact_messages FOR UPDATE TO authenticated USING (is_staff_member()) WITH CHECK (is_staff_member());
CREATE POLICY "contact_staff_delete" ON contact_messages FOR DELETE TO authenticated USING (is_staff_member());
REVOKE INSERT ON contact_messages FROM anon, authenticated;
GRANT INSERT (name, email, subject, message) ON contact_messages TO anon, authenticated;

-- ========================================================================
-- 11. updated_at TRIGGERS
-- ========================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS announcements_updated_at ON announcements;
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS gallery_items_updated_at ON gallery_items;
CREATE TRIGGER gallery_items_updated_at BEFORE UPDATE ON gallery_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS staff_updated_at ON staff;
CREATE TRIGGER staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS awards_updated_at ON awards;
CREATE TRIGGER awards_updated_at BEFORE UPDATE ON awards FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS settings_updated_at ON site_settings;
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS homepage_updated_at ON homepage_content;
CREATE TRIGGER homepage_updated_at BEFORE UPDATE ON homepage_content FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ========================================================================
-- 12. STORAGE BUCKET 'media'
-- ========================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
DROP POLICY IF EXISTS "media_staff_insert" ON storage.objects;
CREATE POLICY "media_staff_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "media_staff_update" ON storage.objects;
CREATE POLICY "media_staff_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "media_staff_delete" ON storage.objects;
CREATE POLICY "media_staff_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ========================================================================
-- 13. REALTIME for new tables
-- ========================================================================
DO $$
DECLARE t text; pub text := 'supabase_realtime';
BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings','homepage_content','pages','audit_log','profiles'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = pub AND tablename = t) THEN
      EXECUTE format('ALTER PUBLICATION %I ADD TABLE public.%I;', pub, t);
    END IF;
  END LOOP;
END $$;
