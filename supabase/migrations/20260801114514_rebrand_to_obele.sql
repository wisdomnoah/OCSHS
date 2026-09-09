/*
# Rebrand seed content from "Nova Heights" to "Obele Community Senior High School"

## Overview
Renames all "Nova Heights" references in seeded content to the new school
identity. Two-step REPLACE so the long form is substituted first, then any
remaining short form becomes the short code "OCSHS" for casual interjections.

## Changes
- announcements, events, awards, programs, staff, timeline_milestones:
  'Nova Heights High School' -> 'Obele Community Senior High School'
  'Nova Heights'              -> 'OCSHS'
No schema changes; no data loss.
*/
UPDATE announcements
  SET title = REPLACE(REPLACE(title, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS'),
      body  = REPLACE(REPLACE(body,  'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS');

UPDATE events
  SET title = REPLACE(REPLACE(title, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS'),
      description = REPLACE(REPLACE(description, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS');

UPDATE awards
  SET title = REPLACE(REPLACE(title, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS'),
      description = REPLACE(REPLACE(description, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS'),
      recipient = REPLACE(REPLACE(recipient, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS');

UPDATE programs
  SET name = REPLACE(REPLACE(name, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS'),
      description = REPLACE(REPLACE(description, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS');

UPDATE staff
  SET bio = REPLACE(REPLACE(bio, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS');

UPDATE timeline_milestones
  SET title = REPLACE(REPLACE(title, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS'),
      description = REPLACE(REPLACE(description, 'Nova Heights High School', 'Obele Community Senior High School'), 'Nova Heights', 'OCSHS');
