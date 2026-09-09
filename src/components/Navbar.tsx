import { useEffect, useState } from 'react';
import { Menu, X, GraduationCap, Sun, Moon } from 'lucide-react';
import { navigate, useRoute } from '@/lib/router';
import { useTheme } from '@/lib/theme';

const LINKS: { label: string; path: string }[] = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Calendar', path: '/announcements' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Staff', path: '/staff' },
  { label: 'Awards', path: '/awards' },
  { label: 'Programs', path: '/programs' },
  { label: 'Contact', path: '/contact' },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-lilac hover:text-white"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Navbar() {
  const path = useRoute();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [path]);

  const go = (p: string) => { navigate(p); setOpen(false); };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b' : 'border-b border-transparent bg-transparent'}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => go('/')} className="group flex items-center gap-2.5" aria-label="OCSHS home">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-lilac">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-semibold tracking-tight text-white">OCSHS</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-cream/50">Obele Community SHS</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <button key={l.path} onClick={() => go(l.path)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${path === l.path ? 'text-lilac-300' : 'text-cream/70 hover:text-white'}`}>
              {l.label}
            </button>
          ))}
          <div className="mx-1 flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button className="grid h-10 w-10 place-items-center rounded-lg bg-surface-2 text-cream" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass border-t lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {LINKS.map((l) => (
              <button key={l.path} onClick={() => go(l.path)}
                className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition ${path === l.path ? 'bg-lilac text-white' : 'text-cream/80 hover:bg-surface-2'}`}>
                {l.label}
              </button>
            ))}

          </div>
        </div>
      )}
    </header>
  );
}
