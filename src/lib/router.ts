import { useEffect, useState } from 'react';

export function getPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export function navigate(path: string) {
  if (getPath() === path) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useRoute(): string {
  const [path, setPath] = useState<string>(getPath());
  useEffect(() => {
    const onChange = () => setPath(getPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

/** True if path starts with /admin */
export function isAdminRoute(path: string): boolean {
  return path.startsWith('/admin');
}

/** Extract the admin sub-route, e.g. /admin/announcements -> announcements */
export function adminSubRoute(path: string): string {
  const m = path.match(/^\/admin\/(.+)$/);
  return m ? m[1] : '';
}
