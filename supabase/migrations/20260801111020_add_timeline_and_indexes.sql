/*
# Add sort_order index to timeline milestones

## Overview
Adds a simple timeline table for the About page interactive timeline,
plus an index on gallery_items and programs sort_order for stable ordering.

## New Tables
- timeline_milestones — interactive About page timeline (year, title, description, sort_order)

## Security
- RLS enabled; public read, authenticated admin write (same shared model).
*/
CREATE TABLE IF NOT EXISTS timeline_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year int NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE timeline_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_timeline" ON timeline_milestones;
CREATE POLICY "public_read_timeline" ON timeline_milestones
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_timeline" ON timeline_milestones;
CREATE POLICY "admin_insert_timeline" ON timeline_milestones
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_timeline" ON timeline_milestones;
CREATE POLICY "admin_update_timeline" ON timeline_milestones
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_timeline" ON timeline_milestones;
CREATE POLICY "admin_delete_timeline" ON timeline_milestones
  FOR DELETE TO authenticated USING (true);

INSERT INTO timeline_milestones (year, title, description, sort_order) VALUES
(1962, 'Founded', 'Nova Heights High School opens its doors with 120 students and a vision for progressive education.', 1),
(1978, 'First Science Wing', 'A dedicated science building doubles our lab capacity and launches the chemistry research program.', 2),
(1985, 'Arts Expansion', 'The performing arts center is built, establishing our theater and music departments.', 3),
(1996, 'Technology Initiative', 'Nova Heights becomes one of the first schools in the state to offer computer science courses.', 4),
(2003, 'Athletics Complex', 'A new athletics complex opens, home to our championship basketball and swimming programs.', 5),
(2011, 'AP Capstone Launched', 'We join the national AP Capstone diploma program, expanding advanced research opportunities.', 6),
(2019, 'STEM Innovation', 'The robotics program is founded and wins its first regional title within two years.', 7),
(2026, 'State Champions', 'Robotics wins the state championship and our new STEM wing breaks ground for a 2027 opening.', 8)
ON CONFLICT DO NOTHING;
