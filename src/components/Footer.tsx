import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react';
import { navigate } from '@/lib/router';
import { useSiteSettings } from '@/lib/hooks';

const groups: { title: string; links: { label: string; path: string }[] }[] = [
  { title: 'Explore', links: [
    { label: 'Home', path: '/' }, { label: 'About', path: '/about' },
    { label: 'Calendar', path: '/announcements' }, { label: 'Gallery', path: '/gallery' },
  ]},
  { title: 'Community', links: [
    { label: 'Staff Directory', path: '/staff' }, { label: 'Awards', path: '/awards' },
    { label: 'Programs & Clubs', path: '/programs' }, { label: 'Contact', path: '/contact' },
  ]},
];

export function Footer() {
  const { settings } = useSiteSettings();
  const schoolName = settings?.school_name ?? 'Obele Community Senior High School';
  const motto = settings?.motto ?? 'Honesty, Obedience, and Hard Work';
  const address = settings?.address ?? '82, Randle Avenue, Surulere, Lagos, Nigeria';
  const phone = settings?.phone ?? '08150820178';
  const email = settings?.email ?? 'obelesenior@gmail.com';

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-950/60">
      <div className="absolute inset-x-0 top-0 h-px glow-divider" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-lilac/40 bg-lilac/10">
                <GraduationCap className="h-5 w-5 text-lilac-300" />
              </span>
              <span className="font-display text-base font-semibold text-white">{schoolName}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
              {motto}. Empowering the Surulere community
              through quality education since 1981 — proudly 39 graduating sets strong.
            </p>
            <div className="mt-6 space-y-2 text-sm text-cream/60">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-lilac/70" /> {address}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-lilac/70" /> {phone}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-lilac/70" /> {email}</p>
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/40">{g.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.path}>
                    <button onClick={() => navigate(l.path)} className="link-underline text-sm text-cream/70">{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {schoolName} ({settings?.school_short ?? 'OCSHS'}). All rights reserved.</p>
          <p className="font-display tracking-wide text-lilac/60">Honesty · Obedience · Hard Work</p>
        </div>
      </div>
    </footer>
  );
}
