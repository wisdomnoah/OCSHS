import { supabase } from './supabase';
import type { MediaItem } from './types';

const BUCKET = 'media';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

function uid(): string | null {
  return supabase.auth.getUser ? null : null; // placeholder — actual uid read in caller
}

export async function uploadMedia(
  file: File,
  userId: string
): Promise<{ url: string; path: string; error: string | null }> {
  if (file.size > MAX_SIZE) {
    return { url: '', path: '', error: 'File too large. Maximum 5 MB.' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: '', path: '', error: 'Unsupported file type. Use JPG, PNG, WebP, GIF, or SVG.' };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${userId}/${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { url: '', path: '', error: 'Upload failed. Please try again.' };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, path, error: null };
}

export async function deleteMedia(path: string): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return { error: error ? 'Failed to delete file.' : null };
}

export async function listMedia(userId: string): Promise<{ items: MediaItem[]; error: string | null }> {
  const { data, error } = await supabase.storage.from(BUCKET).list(userId, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) return { items: [], error: 'Failed to load media.' };
  const items: MediaItem[] = (data ?? [])
    .filter((f) => !f.id.endsWith('.emptyFolderPlaceholder'))
    .map((f) => {
      const path = `${userId}/${f.name}`;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return {
        ...f,
        publicUrl: pub.publicUrl,
      } as MediaItem;
    });
  return { items, error: null };
}

export { BUCKET };
