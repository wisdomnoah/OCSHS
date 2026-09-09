/*
# Nova Heights High School — full site schema with seed data

## Overview
Creates the complete data layer for a futuristic high school website with an
admin dashboard. Six content tables power the public site; all are publicly
readable (the site is a brochure — no login needed to view) and writable only
by authenticated administrators.

## New Tables
1. announcements — ticker/hero notices (title, body, priority, is_pinned)
2. events — calendar entries (title, description, event_date, end_date, location, category)
3. gallery_items — bento-grid campus photos (title, category, image_url, description, sort_order)
4. awards — trophy wall entries (title, description, year, recipient, category)
5. staff — directory entries (name, department, role, email, photo_url, bio, sort_order)
6. programs — clubs & academic programs (name, category, description, image_url, meeting_time, advisor, sort_order)

## Security
- RLS enabled on every table.
- SELECT: TO anon, authenticated USING (true) — content is intentionally public.
- INSERT / UPDATE / DELETE: TO authenticated only — any logged-in admin manages all content
  (shared editorial model, no per-row ownership).
- No user_id columns — this is a shared-content site, not per-user data.

## Seed Data
- 5 announcements, 7 events, 12 gallery images, 8 awards, 8 staff, 10 programs.
- Gallery and staff use real Pexels stock photo URLs.
- Event dates span the 2026-2027 academic year.
*/

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
CREATE POLICY "public_read_announcements" ON announcements
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_announcements" ON announcements;
CREATE POLICY "admin_insert_announcements" ON announcements
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_announcements" ON announcements;
CREATE POLICY "admin_update_announcements" ON announcements
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_announcements" ON announcements;
CREATE POLICY "admin_delete_announcements" ON announcements
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  end_date date,
  location text,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general','academic','arts','sports','community','exam')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "public_read_events" ON events
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_events" ON events;
CREATE POLICY "admin_insert_events" ON events
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_events" ON events;
CREATE POLICY "admin_update_events" ON events
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_events" ON events;
CREATE POLICY "admin_delete_events" ON events
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- GALLERY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'campus' CHECK (category IN ('campus','academics','arts','sports','community')),
  image_url text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON gallery_items;
CREATE POLICY "public_read_gallery" ON gallery_items
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery_items;
CREATE POLICY "admin_insert_gallery" ON gallery_items
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_gallery" ON gallery_items;
CREATE POLICY "admin_update_gallery" ON gallery_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery_items;
CREATE POLICY "admin_delete_gallery" ON gallery_items
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- AWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  year int NOT NULL,
  recipient text,
  category text NOT NULL DEFAULT 'academic' CHECK (category IN ('academic','arts','sports','community','innovation')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_awards" ON awards;
CREATE POLICY "public_read_awards" ON awards
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_awards" ON awards;
CREATE POLICY "admin_insert_awards" ON awards
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_awards" ON awards;
CREATE POLICY "admin_update_awards" ON awards
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_awards" ON awards;
CREATE POLICY "admin_delete_awards" ON awards
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- STAFF
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL,
  role text NOT NULL,
  email text,
  photo_url text,
  bio text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_staff" ON staff;
CREATE POLICY "public_read_staff" ON staff
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_staff" ON staff;
CREATE POLICY "admin_insert_staff" ON staff
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_staff" ON staff;
CREATE POLICY "admin_update_staff" ON staff
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_staff" ON staff;
CREATE POLICY "admin_delete_staff" ON staff
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- PROGRAMS & CLUBS
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'club' CHECK (category IN ('academic','arts','sports','stem','service','club')),
  description text,
  image_url text,
  meeting_time text,
  advisor text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_programs" ON programs;
CREATE POLICY "public_read_programs" ON programs
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_programs" ON programs;
CREATE POLICY "admin_insert_programs" ON programs
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_programs" ON programs;
CREATE POLICY "admin_update_programs" ON programs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_programs" ON programs;
CREATE POLICY "admin_delete_programs" ON programs
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO announcements (title, body, priority, is_pinned) VALUES
('Fall Semester Begins September 2', 'Welcome back, Nova Heights! Classes resume Tuesday, September 2. Check your schedule on the student portal.', 'high', true),
('State Robotics Championship — We Won!', 'Our Robotics Team took first place at the State Championship. Congratulations to all team members and Coach Martinez.', 'urgent', true),
('Parent-Teacher Conferences Oct 15-16', 'Schedule your conference slots online. Early booking recommended for preferred time slots.', 'normal', false),
('New STEM Wing Opening January 2027', 'Construction is 80% complete on our new 12,000 sq ft STEM innovation wing featuring three labs and a maker space.', 'normal', false),
('Winter Arts Festival Tickets On Sale', 'Tickets for the December Winter Arts Festival are now available. Students get free entry with ID.', 'low', false)
ON CONFLICT DO NOTHING;

INSERT INTO events (title, description, event_date, end_date, location, category) VALUES
('First Day of Fall Semester', 'Welcome back! Homeroom begins at 8:00 AM sharp.', '2026-09-02', NULL, 'Main Campus', 'academic'),
('Fall Sports Tryouts', 'Tryouts for basketball, swimming, and track. Bring physical forms.', '2026-09-08', '2026-09-10', 'Athletics Complex', 'sports'),
('Back to School Night', 'Parents meet teachers and tour classrooms from 6-8 PM.', '2026-09-17', NULL, 'Main Auditorium', 'community'),
('State Robotics Championship', 'Our team competes in the statewide finals.', '2026-10-04', NULL, 'State Convention Center', 'academic'),
('Parent-Teacher Conferences', 'Book your 15-minute slots online. Virtual options available.', '2026-10-15', '2026-10-16', 'Classrooms & Virtual', 'community'),
('Midterm Exam Week', 'First semester midterm examinations. Schedule posted on portal.', '2026-11-09', '2026-11-13', 'All Classrooms', 'exam'),
('Winter Arts Festival', 'Two nights of music, theater, and visual arts showcases.', '2026-12-11', '2026-12-12', 'Performing Arts Center', 'arts')
ON CONFLICT DO NOTHING;

INSERT INTO gallery_items (title, category, image_url, description, sort_order) VALUES
('Main Campus', 'campus', 'https://images.pexels.com/photos/11932106/pexels-photo-11932106.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Our flagship academic building framed by open green space.', 1),
('Innovation Hall', 'campus', 'https://images.pexels.com/photos/27907978/pexels-photo-27907978.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'The new entrance pavilion welcoming students daily.', 2),
('Heritage Building', 'campus', 'https://images.pexels.com/photos/35314982/pexels-photo-35314982.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Our historic brick building, home to the humanities wing.', 3),
('Chemistry Lab', 'academics', 'https://images.pexels.com/photos/8471913/pexels-photo-8471913.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Hands-on experimentation in our state-of-the-art chemistry lab.', 4),
('Research Team', 'academics', 'https://images.pexels.com/photos/8514628/pexels-photo-8514628.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Students collaborate on a year-long research project.', 5),
('The Library', 'academics', 'https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Two floors of resources, quiet study zones, and digital archives.', 6),
('Study Session', 'academics', 'https://images.pexels.com/photos/9489917/pexels-photo-9489917.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Peer study groups are a daily ritual in our library.', 7),
('Basketball Court', 'sports', 'https://images.pexels.com/photos/34197287/pexels-photo-34197287.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Home court advantage in our championship-grade gymnasium.', 8),
('Game Night', 'sports', 'https://images.pexels.com/photos/37356517/pexels-photo-37356517.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Varsity basketball in action during the regional finals.', 9),
('Dance Recital', 'arts', 'https://images.pexels.com/photos/11993869/pexels-photo-11993869.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'The dance ensemble rehearsing for the winter showcase.', 10),
('Theater Workshop', 'arts', 'https://images.pexels.com/photos/6896332/pexels-photo-6896332.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Drama students rehearse an original one-act play.', 11),
('Commencement', 'community', 'https://images.pexels.com/photos/30562665/pexels-photo-30562665.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'The Class of 2026 celebrates graduation day.', 12)
ON CONFLICT DO NOTHING;

INSERT INTO awards (title, description, year, recipient, category) VALUES
('State Robotics Championship', 'First place out of 64 teams in the statewide robotics finals.', 2026, 'Robotics Team & Coach Martinez', 'innovation'),
('National Merit Finalists', 'Seven students named National Merit Scholarship finalists.', 2026, 'Class of 2026', 'academic'),
('Regional Science Fair', 'Grand prize for a student-designed water purification system.', 2025, 'Priya Anand, Grade 11', 'innovation'),
('State Basketball Champions', 'Varsity boys basketball undefeated season and state title.', 2025, 'Varsity Basketball Team', 'sports'),
('Excellence in Arts Education', 'Statewide award for outstanding visual and performing arts programs.', 2025, 'Arts Department', 'arts'),
('Community Service Award', 'Over 12,000 volunteer hours logged by students in a single year.', 2024, 'Student Body', 'community'),
('AP Scholar School', 'Recognition for high participation and pass rates in Advanced Placement.', 2024, 'Academic Programs', 'academic'),
('Debate Team State Finals', 'Top debate team reaching the state championship round.', 2024, 'Debate Club', 'academic')
ON CONFLICT DO NOTHING;

INSERT INTO staff (name, department, role, email, photo_url, bio, sort_order) VALUES
('Dr. Evelyn Carter', 'Administration', 'Principal', 'ecarter@novaheights.edu', 'https://images.pexels.com/photos/8423069/pexels-photo-8423069.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Ed.D. in Educational Leadership, 15 years in school administration.', 1),
('James Okafor', 'Administration', 'Vice Principal', 'jokafor@novaheights.edu', 'https://images.pexels.com/photos/8617936/pexels-photo-8617936.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'M.Ed. in School Management, oversees student affairs and athletics.', 2),
('Sarah Mitchell', 'Science', 'Department Head, Chemistry', 'smitchell@novaheights.edu', 'https://images.pexels.com/photos/6981004/pexels-photo-6981004.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'M.S. in Chemistry, leads the AP Chemistry and research programs.', 3),
('David Chen', 'Mathematics', 'AP Calculus & Statistics', 'dchen@novaheights.edu', 'https://images.pexels.com/photos/5212321/pexels-photo-5212321.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'M.A. in Mathematics, 12 years teaching advanced math courses.', 4),
('Maria Rodriguez', 'Arts', 'Visual Arts & Theater Director', 'mrodriguez@novaheights.edu', 'https://images.pexels.com/photos/8363756/pexels-photo-8363756.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'M.F.A. in Fine Arts, directs the annual arts festival and theater productions.', 5),
('Robert Johnson', 'Physical Education', 'Athletics Director', 'rjohnson@novaheights.edu', 'https://images.pexels.com/photos/6325958/pexels-photo-6325958.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'M.S. in Kinesiology, coaches basketball and oversees all athletic programs.', 6),
('Jennifer Park', 'English', 'AP Literature & Creative Writing', 'jpark@novaheights.edu', 'https://images.pexels.com/photos/10816007/pexels-photo-10816007.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'M.A. in English Literature, advisor for the school literary magazine.', 7),
('Michael Thompson', 'Technology', 'Computer Science & Robotics', 'mthompson@novaheights.edu', 'https://images.pexels.com/photos/12311567/pexels-photo-12311567.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'M.S. in Computer Science, coaches the state champion robotics team.', 8)
ON CONFLICT DO NOTHING;

INSERT INTO programs (name, category, description, image_url, meeting_time, advisor, sort_order) VALUES
('Robotics Club', 'stem', 'Design, build, and program competitive robots. Our team won the 2026 State Championship.', 'https://images.pexels.com/photos/8471913/pexels-photo-8471913.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Tuesdays & Thursdays, 3:30-5:30 PM', 'Michael Thompson', 1),
('Debate Society', 'academic', 'Competitive debate team reaching state finals. Develops argumentation, research, and public speaking skills.', NULL, 'Mondays, 3:30-5:00 PM', 'Jennifer Park', 2),
('Varsity Basketball', 'sports', 'Undefeated 2025 state champions. Tryouts each fall for boys and girls teams.', 'https://images.pexels.com/photos/34197287/pexels-photo-34197287.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Daily practice, 3:30-5:30 PM', 'Robert Johnson', 3),
('Drama Club', 'arts', 'Produces two full productions and a festival of one-act plays each year.', 'https://images.pexels.com/photos/6896332/pexels-photo-6896332.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Wednesdays, 3:30-5:30 PM', 'Maria Rodriguez', 4),
('AP Capstone', 'academic', 'A two-year research and seminar program culminating in an independent research project.', NULL, 'During school hours', 'Sarah Mitchell', 5),
('Dance Ensemble', 'arts', 'Contemporary and classical dance. Performs at the winter and spring festivals.', 'https://images.pexels.com/photos/11993869/pexels-photo-11993869.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Fridays, 3:30-5:00 PM', 'Maria Rodriguez', 6),
('Environmental Action Club', 'service', 'Student-led sustainability initiatives including campus recycling and community cleanups.', NULL, 'Thursdays, 3:30-4:30 PM', 'David Chen', 7),
('Computer Science Society', 'stem', 'Coding workshops, hackathons, and web development projects open to all skill levels.', 'https://images.pexels.com/photos/5530520/pexels-photo-5530520.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Tuesdays, 3:30-5:00 PM', 'Michael Thompson', 8),
('Model UN', 'academic', 'Delegates simulate UN committees at regional and national conferences.', NULL, 'Mondays, 3:30-5:00 PM', 'Jennifer Park', 9),
('Community Service Corps', 'service', 'Coordinates volunteer opportunities with local nonprofits. Over 12,000 hours logged in 2024.', NULL, 'Flexible schedule', 'James Okafor', 10)
ON CONFLICT DO NOTHING;
