/*
# Obele Community Senior High School — real school data reseed

## Overview
Wipes and re-seeds all content tables with the REAL Obele Community SHS data
supplied by the school: founded 1981, 39 graduating sets, 804 students, 26
teachers, Principal Mr. FALAIYE OLUGBENGA ADEDIRUN, Vice Principal
Mr. KOLAWOLE AREGBEDE, address 82 Randle Avenue Surulere Lagos Nigeria,
email obelesenior@gmail.com, phone 08150820178.

This is a DATA-only refresh. No schema changes. RLS stays exactly as-is
(public read, authenticated admin write). Uses TRUNCATE ... RESTART IDENTITY
to give a clean slate; the gen_random_uuid() primary keys regenerate.
*/

TRUNCATE TABLE
  announcements,
  events,
  gallery_items,
  awards,
  staff,
  programs,
  timeline_milestones,
  contact_messages
RESTART IDENTITY CASCADE;

-- ============================ TIMELINE (1981 → now) ============================
INSERT INTO timeline_milestones (year, title, description, sort_order) VALUES
(1981, 'Founded', 'Obele Community Senior High School opens its doors in Surulere, Lagos — the first graduating set begins its journey.', 1),
(1985, 'Science Block Built', 'A dedicated science block is added, establishing Physics, Chemistry and Biology laboratories.', 2),
(1990, 'Fifth Set Graduates', 'OCSHS celebrates its fifth graduating set, cementing a growing alumni community.', 3),
(1997, 'Library & ICT Wing', 'A central library and the school''s first computer lab open, introducing ICT to the curriculum.', 4),
(2003, 'Inter-house Sports Standardised', 'The annual inter-house sports competition becomes a flagship community event at the township stadium.', 5),
(2008, 'Debating Society Champions', 'The Debating Society wins the Lagos State senior schools debate championship for the first time.', 6),
(2012, 'Curriculum Modernisation', 'Senior secondary curriculum is expanded with stronger Agricultural Science, Commerce and Technical Drawing offerings.', 7),
(2018, 'Alumni Endowment Fund', 'The OCSHS Alumni Association launches an endowment to fund scholarships and classroom upgrades.', 8),
(2021, '39th Graduating Set', 'Despite pandemic disruptions, OCSHS proudly graduates its 39th set of alumni — a community milestone.', 9),
(2024, 'Digital Classroom Initiative', 'Smart boards and internet access are rolled out across senior classrooms.', 10),
(2026, 'Today', '804 students and 26 dedicated teachers continue the motto: Honesty, Obedience, and Hard Work.', 11)
ON CONFLICT DO NOTHING;

-- ============================ STAFF (leadership + departments) ============================
-- 26 teachers total; leadership + department heads + representative set.
INSERT INTO staff (name, department, role, email, photo_url, bio, sort_order) VALUES
('Mr. FALAIYE OLUGBENGA ADEDIRUN', 'Administration', 'Principal', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/12311537/pexels-photo-12311537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Principal of Obele Community Senior High School, leading with a commitment to discipline, academic excellence and community values.', 1),
('Mr. KOLAWOLE AREGBEDE', 'Administration', 'Vice Principal', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/12311549/pexels-photo-12311549.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Vice Principal overseeing academics, school operations and student welfare across all year groups.', 2),
('Mrs. Adebisi Okafor', 'English Language', 'Head of Languages', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/29852895/pexels-photo-29852895.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Leads English Language and Literature-in-English; senior WAEC examiner with 18 years'' experience.', 3),
('Mr. Tunde Bakare', 'Mathematics', 'Head of Mathematics', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/36053652/pexels-photo-36053652.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Heads the Mathematics department; coaches the school''s numeracy olympiad team.', 4),
('Mrs. Folake Eze', 'Sciences', 'Head of Sciences', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/7468194/pexels-photo-7468194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Leads Biology, Chemistry and Physics; oversees the senior science laboratories.', 5),
('Mr. Chidi Nwosu', 'Sciences', 'Physics Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/36741892/pexels-photo-36741892.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Senior Physics teacher and mentor for the school science club.', 6),
('Mrs. Aisha Bello', 'Sciences', 'Chemistry Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/34769115/pexels-photo-34769115.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Chemistry specialist with a passion for practical laboratory learning.', 7),
('Mr. Samuel Adeyemi', 'Mathematics', 'Further Maths Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/12311572/pexels-photo-12311572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Teaches Further Mathematics and Statistics; advisor to the chess club.', 8),
('Mrs. Ngozi Obi', 'Commercial Studies', 'Head of Commercial', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/15227424/pexels-photo-15227424.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Heads Accounting, Commerce and Economics; coordinates the business studies fair.', 9),
('Mr. Emeka Okoro', 'Technical Subjects', 'Head of Technical', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/38758071/pexels-photo-38758071.png?auto=compress&cs=tinysrgb&h=650&w=940', 'Heads Technical Drawing, Woodwork and Basic Technology; runs the makers'' workshop.', 10),
('Mrs. Bisi Williams', 'Arts', 'Head of Arts', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/37079379/pexels-photo-37079379.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Leads Fine Arts, Music and Theatre Arts; directs the annual cultural day showcase.', 11),
('Mr. Daniel Ojo', 'Social Sciences', 'History & Government', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/12311537/pexels-photo-12311537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Teaches History, Government and Civic Education; coach of the debating society.', 12),
('Mrs. Rita Essien', 'Social Sciences', 'Geography Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/9304685/pexels-photo-9304685.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Geography and Environmental Science teacher; coordinates the geography field trips.', 13),
('Mr. Gideon Uche', 'Agricultural Science', 'Head of Agriculture', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/36053652/pexels-photo-36053652.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Leads the school farm and Agricultural Science practicals; advisor to the Young Farmers'' Club.', 14),
('Mrs. Adaeze Eze', 'Guidance & Counselling', 'Guidance Counsellor', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/7468194/pexels-photo-7468194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Supports students'' academic, career and personal development; coordinates university admissions guidance.', 15),
('Mr. Peter Akinola', 'Physical Education', 'Sports Master', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/12311549/pexels-photo-12311549.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Leads Physical Education and coaches the school''s football and athletics teams.', 16),
('Mr. Olumide Fashola', 'Computer Science', 'Head of ICT', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/12311572/pexels-photo-12311572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Heads Computer Science; runs the digital classroom initiative and coding club.', 17),
('Mrs. Joy Obi', 'Christian Religious Studies', 'CRS Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/34769115/pexels-photo-34769115.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Teaches Christian Religious Studies and coordinates moral-instruction assemblies.', 18),
('Mr. Bola Akande', 'Yoruba Studies', 'Yoruba Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/36741892/pexels-photo-36741892.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Teaches Yoruba Language and Literature; advisor to the cultural and drama society.', 19),
('Mrs. Oluwafunmilayo Adebayo', 'English Language', 'Literature Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/29852895/pexels-photo-29852895.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Literature-in-English teacher; coordinates the school press and reading club.', 20),
('Mr. Yakubu Sani', 'Mathematics', 'Mathematics Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/38758071/pexels-photo-38758071.png?auto=compress&cs=tinysrgb&h=650&w=940', 'Senior secondary mathematics teacher specialising in algebra and geometry.', 21),
('Mrs. Chinyere Okeke', 'Sciences', 'Biology Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/37079379/pexels-photo-37079379.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Biology and Health Science teacher; coordinates the school health club.', 22),
('Mr. Femi Odunsi', 'Social Sciences', 'Economics Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/12311537/pexels-photo-12311537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Teaches Economics and Commerce; advisor to the junior achievement club.', 23),
('Mrs. Toyin Coker', 'Arts', 'Fine Arts Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/15227424/pexels-photo-15227424.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Fine Arts teacher; runs the school art studio and annual exhibition.', 24),
('Mr. Daniel Okon', 'Technical Subjects', 'Technical Drawing Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/12311549/pexels-photo-12311549.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Technical Drawing and Basic Technology teacher; mentor for the engineering club.', 25),
('Mrs. Sade Animashaun', 'Commercial Studies', 'Accounting Teacher', 'obelesenior@gmail.com', 'https://images.pexels.com/photos/9304685/pexels-photo-9304685.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Financial Accounting teacher; coordinates the school''s business enterprise club.', 26)
ON CONFLICT DO NOTHING;

-- ============================ ANNOUNCEMENTS ============================
INSERT INTO announcements (title, body, priority, is_pinned) VALUES
('Welcome to the 2026/2027 Session', 'Obele Community SHS welcomes all 804 students back to school. Resumption is Monday 8:00am. Ensure you are in full uniform with all required materials.', 'high', true),
('39th Graduating Set Celebration', 'Join us as we celebrate our 39th set of graduating alumni. The thanksgiving service holds this Friday at the school assembly hall.', 'urgent', true),
('Inter-House Sports 2026', 'The annual inter-house sports competition is set for the township stadium. Parents and alumni are warmly invited to attend.', 'normal', false),
('First C.A. Test Schedule', 'The first Continuous Assessment test begins next week. Students should check the notice board for their subject timetables.', 'normal', false),
('PTA General Meeting', 'There will be a PTA general meeting on Saturday at 10:00am in the school hall. All parents are expected to attend.', 'normal', false),
('Alumni Endowment Fund Drive', 'The OCSHS Alumni Association is collecting for the 2026 endowment to fund scholarships. Contact the school office to contribute.', 'low', false)
ON CONFLICT DO NOTHING;

-- ============================ EVENTS ============================
INSERT INTO events (title, description, event_date, end_date, location, category) VALUES
('New Session Resumption', 'First day of the 2026/2027 academic session. Assembly at 8:00am sharp.', '2026-09-07', NULL, 'School Assembly Hall', 'academic'),
('First C.A. Test', 'First Continuous Assessment across all senior secondary subjects.', '2026-09-21', '2026-09-25', 'All Classrooms', 'exam'),
('Inter-House Sports 2026', 'Annual inter-house athletics competition at the township stadium.', '2026-10-10', NULL, 'Township Stadium, Surulere', 'sports'),
('PTA General Meeting', 'General meeting of the Parents-Teachers Association.', '2026-10-18', NULL, 'School Hall', 'community'),
('39th Set Thanksgiving', 'Thanksgiving service celebrating our 39th graduating set.', '2026-11-06', NULL, 'Assembly Hall', 'community'),
('Cultural Day Showcase', 'Annual cultural day celebrating Nigeria''s diverse heritage with drama, music and food.', '2026-11-20', NULL, 'School Grounds', 'arts'),
('Mock Examinations (SS3)', 'Mock WAEC examinations for all SS3 students.', '2026-12-01', '2026-12-11', 'Examination Hall', 'exam'),
('Carol Service & End of Year', 'Christmas carol service and end-of-year celebration.', '2026-12-16', NULL, 'Assembly Hall', 'arts')
ON CONFLICT DO NOTHING;

-- ============================ GALLERY ============================
INSERT INTO gallery_items (title, category, image_url, description, sort_order) VALUES
('Students in Class', 'academics', 'https://images.pexels.com/photos/34211744/pexels-photo-34211744.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Our students during a class transition in the senior block.', 1),
('Lecture in Progress', 'academics', 'https://images.pexels.com/photos/27769510/pexels-photo-27769510.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'A lively senior secondary lecture at OCSHS.', 2),
('Focused Learning', 'academics', 'https://images.pexels.com/photos/37898351/pexels-photo-37898351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Students attentive in full school uniform during a lesson.', 3),
('Collaborative Study', 'academics', 'https://images.pexels.com/photos/34526416/pexels-photo-34526416.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Group work in a senior secondary classroom.', 4),
('Examination Time', 'academics', 'https://images.pexels.com/photos/37456293/pexels-photo-37456293.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Students sitting a continuous assessment examination.', 5),
('Classroom Learning', 'academics', 'https://images.pexels.com/photos/34526411/pexels-photo-34526411.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Engaged students in a diverse classroom environment.', 6),
('Our Students', 'community', 'https://images.pexels.com/photos/34162709/pexels-photo-34162709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Nigerian schoolchildren in uniform in the OCSHS classroom.', 7),
('At Their Desks', 'academics', 'https://images.pexels.com/photos/34162713/pexels-photo-34162713.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Students attentively engaged in classroom studies.', 8),
('Walking to Class', 'campus', 'https://images.pexels.com/photos/6209356/pexels-photo-6209356.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Students walking through the OCSHS corridor between classes.', 9),
('Campus Pathway', 'campus', 'https://images.pexels.com/photos/7972319/pexels-photo-7972319.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Students on the school pathway with their backpacks.', 10),
('Entering School', 'campus', 'https://images.pexels.com/photos/8500421/pexels-photo-8500421.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Students entering the OCSHS building for morning assembly.', 11),
('39th Set Graduation', 'community', 'https://images.pexels.com/photos/29275615/pexels-photo-29275615.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Our 39th graduating set celebrating their success.', 12)
ON CONFLICT DO NOTHING;

-- ============================ AWARDS ============================
INSERT INTO awards (title, description, year, recipient, category) VALUES
('Lagos State Debate Champions', 'The OCSHS Debating Society won the Lagos State senior schools debate championship.', 2024, 'Debating Society', 'academic'),
('Best SSCE Results in Surulere', 'OCSHS recorded the best WAEC SSCE results among public senior secondary schools in Surulere.', 2023, 'Class of 2023', 'academic'),
('Inter-House Sports - Blue House', 'Blue House claimed the 2023 inter-house sports championship trophy.', 2023, 'Blue House', 'sports'),
('Young Farmers Award', 'The school farm project was recognised by the Lagos State Ministry of Education.', 2022, 'Young Farmers'' Club', 'innovation'),
('Cultural Day Best Performance', 'OCSHS took first place in the Surulere zonal cultural day competition.', 2022, 'Cultural & Drama Society', 'arts'),
('Alumni Scholarship Milestone', 'The Alumni Endowment Fund sponsored 12 students'' WAEC fees in a single year.', 2021, 'OCSHS Alumni Association', 'community'),
('Cleanest School Award', 'OCSHS was named cleanest public senior secondary school in the Surulere local government.', 2020, 'School Community', 'community'),
('Numeracy Olympiad Finalist', 'A student reached the national finals of the junior engineers'' numeracy olympiad.', 2019, 'JSS Computing Team', 'innovation')
ON CONFLICT DO NOTHING;

-- ============================ PROGRAMS & CLUBS ============================
INSERT INTO programs (name, category, description, image_url, meeting_time, advisor, sort_order) VALUES
('Debating Society', 'academic', 'The pride of OCSHS — winners of the Lagos State senior schools debate championship. Develops argumentation, research and public speaking.', 'https://images.pexels.com/photos/34526416/pexels-photo-34526416.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Thursdays, 3:00 - 4:30pm', 'Mr. Daniel Ojo', 1),
('Science Club', 'stem', 'Hands-on experiments and projects across Physics, Chemistry and Biology. Open to all senior students.', 'https://images.pexels.com/photos/37898351/pexels-photo-37898351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Wednesdays, 3:00 - 5:00pm', 'Mrs. Folake Eze', 2),
('Cultural & Drama Society', 'arts', 'Showcases Nigerian heritage through drama, music and dance. Organisers of the annual cultural day.', 'https://images.pexels.com/photos/34211744/pexels-photo-34211744.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Fridays, 3:30 - 5:00pm', 'Mrs. Bisi Williams', 3),
('Football Team', 'sports', 'The school football team competes in the Surulere zonal league. Tryouts each term.', 'https://images.pexels.com/photos/8500421/pexels-photo-8500421.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Tuesdays & Thursdays, 3:30 - 5:30pm', 'Mr. Peter Akinola', 4),
('Young Farmers'' Club', 'service', 'Runs the OCSHS school farm — vegetable beds, poultry and a small cassava plot. Award-winning project.', 'https://images.pexels.com/photos/6209356/pexels-photo-6209356.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Mondays, 3:30 - 5:00pm', 'Mr. Gideon Uche', 5),
('Coding Club', 'stem', 'Learn web development and introductory programming as part of the digital classroom initiative.', 'https://images.pexels.com/photos/34526411/pexels-photo-34526411.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Wednesdays, 3:30 - 5:00pm', 'Mr. Olumide Fashola', 6),
('School Press & Reading Club', 'academic', 'Produces the school magazine and runs the reading corner. Fosters creative writing and journalism.', NULL, 'Tuesdays, 3:00 - 4:30pm', 'Mrs. Oluwafunmilayo Adebayo', 7),
('Chess Club', 'club', 'Weekly games and internal tournaments. All skill levels welcome.', NULL, 'Fridays, 3:00 - 4:30pm', 'Mr. Samuel Adeyemi', 8),
('Business Enterprise Club', 'service', 'Students run a small school-based enterprise, learning accounting, marketing and teamwork.', NULL, 'Thursdays, 3:30 - 5:00pm', 'Mrs. Sade Animashaun', 9),
('Geography Field Trip Group', 'academic', 'Organises local field studies across Lagos and Ogun states. Linked to the SS curriculum.', NULL, 'Scheduled by term', 'Mrs. Rita Essien', 10)
ON CONFLICT DO NOTHING;
