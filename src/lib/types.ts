export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type EventCategory = 'general' | 'academic' | 'arts' | 'sports' | 'community' | 'exam';
export type GalleryCategory = 'campus' | 'academics' | 'arts' | 'sports' | 'community';
export type AwardCategory = 'academic' | 'arts' | 'sports' | 'community' | 'innovation';
export type ProgramCategory = 'academic' | 'arts' | 'sports' | 'stem' | 'service' | 'club';
export type ContentStatus = 'draft' | 'published';
export type UserRole = 'super_admin' | 'content_editor';

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  priority: Priority;
  is_pinned: boolean;
  created_at: string;
  status: ContentStatus;
  published_at: string | null;
  featured_image_url: string | null;
  updated_at: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  category: EventCategory;
  created_at: string;
  status: ContentStatus;
  published_at: string | null;
  event_time: string | null;
  image_url: string | null;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  image_url: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  status: ContentStatus;
  updated_at: string;
}

export interface Award {
  id: string;
  title: string;
  description: string | null;
  year: number;
  recipient: string | null;
  category: AwardCategory;
  created_at: string;
  status: ContentStatus;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string | null;
  photo_url: string | null;
  bio: string | null;
  sort_order: number;
  created_at: string;
  status: ContentStatus;
  updated_at: string;
}

export interface Program {
  id: string;
  name: string;
  category: ProgramCategory;
  description: string | null;
  image_url: string | null;
  meeting_time: string | null;
  advisor: string | null;
  sort_order: number;
  created_at: string;
}

export interface TimelineMilestone {
  id: string;
  year: number;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  school_name: string;
  school_short: string;
  motto: string;
  mission: string | null;
  vision: string | null;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  opening_hours: string;
  updated_at: string;
}

export interface HomepageContent {
  id: number;
  hero_title: string;
  hero_description: string;
  hero_image_url: string;
  hero_button_text: string;
  hero_button_link: string;
  about_title: string;
  about_description: string | null;
  principal_message: string | null;
  principal_name: string;
  principal_photo_url: string | null;
  stat_students: number;
  stat_teachers: number;
  stat_graduating_sets: number;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  featured_image_url: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
  full_name: string | null;
  disabled: boolean;
}

export interface MediaItem {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: { size: number; mimetype: string; [k: string]: unknown };
  publicUrl: string;
}

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Info', color: 'bg-emerald text-emerald' },
  normal: { label: 'Notice', color: 'bg-surface-2 text-cream' },
  high: { label: 'Important', color: 'bg-lilac text-white' },
  urgent: { label: 'Urgent', color: 'bg-red-500 text-white' },
};

export const EVENT_CATEGORY_META: Record<EventCategory, { label: string; color: string }> = {
  general: { label: 'General', color: 'bg-surface-2 text-cream' },
  academic: { label: 'Academic', color: 'bg-lilac text-white' },
  arts: { label: 'Arts', color: 'bg-fuchsia-500 text-white' },
  sports: { label: 'Sports', color: 'bg-emerald text-emerald' },
  community: { label: 'Community', color: 'bg-amber-500 text-amber-950' },
  exam: { label: 'Exams', color: 'bg-red-500 text-white' },
};

export const AWARD_CATEGORY_META: Record<AwardCategory, { label: string; color: string }> = {
  academic: { label: 'Academic', color: 'bg-lilac text-white' },
  arts: { label: 'Arts', color: 'bg-fuchsia-500 text-white' },
  sports: { label: 'Sports', color: 'bg-emerald text-emerald' },
  community: { label: 'Community', color: 'bg-amber-500 text-amber-950' },
  innovation: { label: 'Innovation', color: 'bg-cyan-500 text-cyan-950' },
};

export const PROGRAM_CATEGORY_META: Record<ProgramCategory, { label: string; color: string }> = {
  academic: { label: 'Academic', color: 'bg-lilac text-white' },
  arts: { label: 'Arts', color: 'bg-fuchsia-500 text-white' },
  sports: { label: 'Sports', color: 'bg-emerald text-emerald' },
  stem: { label: 'STEM', color: 'bg-cyan-500 text-cyan-950' },
  service: { label: 'Service', color: 'bg-amber-500 text-amber-950' },
  club: { label: 'Club', color: 'bg-surface-2 text-cream' },
};

export const GALLERY_CATEGORY_META: Record<GalleryCategory, string> = {
  campus: 'Campus',
  academics: 'Academics',
  arts: 'Arts',
  sports: 'Sports',
  community: 'Community',
};

export const STATUS_META: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-amber-500 text-amber-950' },
  published: { label: 'Published', color: 'bg-emerald text-emerald' },
};

export const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-lilac text-white' },
  content_editor: { label: 'Content Editor', color: 'bg-emerald text-emerald' },
};
