import { useState } from 'react';
import {
  LayoutDashboard, Home, School, MessageSquareText, Megaphone, CalendarDays,
  Images, BookOpen, Users, ClipboardList, Phone, FileText, FolderOpen,
  Settings as SettingsIcon, UserCog, ScrollText, LogOut, Menu, X, GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { navigate } from '@/lib/router';
import { AdminDashboard } from './AdminDashboard';
import { AdminHomepage } from './sections/AdminHomepage';
import { AdminAnnouncements } from './sections/AdminAnnouncements';
import { AdminEvents } from './sections/AdminEvents';
import { AdminGallery } from './sections/AdminGallery';
import { AdminStaff } from './sections/AdminStaff';
import { AdminSettings } from './sections/AdminSettings';
import { AdminPages } from './sections/AdminPages';
import { AdminMedia } from './sections/AdminMedia';
import { AdminUsers } from './sections/AdminUsers';
import { AdminAuditLog } from './sections/AdminAuditLog';
import { AdminMessages } from './sections/AdminMessages';
import type { UserRole } from '@/lib/types';

type Section =
  | 'dashboard' | 'homepage' | 'about' | 'principal' | 'announcements'
  | 'events' | 'gallery' | 'academics' | 'staff' | 'admissions'
  | 'contact' | 'pages' | 'media' | 'users' | 'settings' | 'audit';

interface NavItem {
  key: Section;
  label: string;
  icon: typeof Home;
  roles?: UserRole[];
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { key: 'homepage', label: 'Homepage', icon: Home },
      { key: 'about', label: 'About School', icon: School },
      { key: 'principal', label: "Principal's Message", icon: MessageSquareText },
      { key: 'announcements', label: 'Announcements', icon: Megaphone },
      { key: 'events', label: 'Events', icon: CalendarDays },
      { key: 'gallery', label: 'Gallery', icon: Images },
      { key: 'academics', label: 'Academics', icon: BookOpen },
      { key: 'staff', label: 'Staff / Teachers', icon: Users },
      { key: 'admissions', label: 'Admissions', icon: ClipboardList },
    ],
  },
  {
    label: 'Site',
    items: [
      { key: 'contact', label: 'Contact Info', icon: Phone },
      { key: 'pages', label: 'Pages', icon: FileText },
      { key: 'media', label: 'Media Library', icon: FolderOpen },
    ],
  },
  {
    label: 'Administration',
    items: [
      { key: 'users', label: 'Users', icon: UserCog, roles: ['super_admin'] },
      { key: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['super_admin'] },
      { key: 'audit', label: 'Audit Log', icon: ScrollText, roles: ['super_admin'] },
    ],
  },
];

function sectionFromRoute(route: string): Section {
  const sub = route.replace(/^\/admin\/?/, '');
  const map: Record<string, Section> = {
    '': 'dashboard',
    homepage: 'homepage',
    about: 'about',
    principal: 'principal',
    announcements: 'announcements',
    events: 'events',
    gallery: 'gallery',
    academics: 'academics',
    staff: 'staff',
    admissions: 'admissions',
    contact: 'contact',
    pages: 'pages',
    media: 'media',
    users: 'users',
    settings: 'settings',
    audit: 'audit',
  };
  return map[sub] ?? 'dashboard';
}

export function AdminApp({ route }: { route: string }) {
  const { user, signOut, role, isSuperAdmin } = useAuth();
  const [section, setSection] = useState<Section>(sectionFromRoute(route));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (s: Section) => {
    setSection(s);
    setSidebarOpen(false);
    navigate(s === 'dashboard' ? '/admin' : `/admin/${s}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const filteredGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => !item.roles || item.roles.includes(role as UserRole)),
  })).filter((g) => g.items.length > 0);

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <AdminDashboard onNavigate={go} />;
      case 'homepage': return <AdminHomepage />;
      case 'announcements': return <AdminAnnouncements />;
      case 'events': return <AdminEvents />;
      case 'gallery': return <AdminGallery />;
      case 'staff': return <AdminStaff />;
      case 'settings': return <AdminSettings />;
      case 'pages': return <AdminPages />;
      case 'media': return <AdminMedia />;
      case 'users': return <AdminUsers isSuperAdmin={isSuperAdmin} />;
      case 'audit': return <AdminAuditLog />;
      case 'contact': return <AdminSettings />;
      case 'about': return <AdminHomepage />;
      case 'principal': return <AdminHomepage />;
      case 'academics': return <AdminPages />;
      case 'admissions': return <AdminPages />;
      default: return <AdminDashboard onNavigate={go} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/10 bg-ink-900/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-lilac/40 bg-lilac/10">
              <GraduationCap className="h-5 w-5 text-lilac-300" />
            </span>
            <span className="font-display text-sm font-semibold text-white">OCSHS Admin</span>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-4 overflow-y-auto px-3 py-4" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {filteredGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-cream/30">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = section === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => go(item.key)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active ? 'bg-lilac/10 text-lilac-300' : 'text-cream/60 hover:bg-white/5 hover:text-white'}`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-auto border-t border-white/10 pt-3">
            <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-cream/60 transition hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-ink-900/80 backdrop-blur-xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-cream lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display text-sm font-semibold text-white capitalize">
              {NAV_GROUPS.flatMap((g) => g.items).find((i) => i.key === section)?.label ?? 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-cream/50 sm:block">{user?.email}</span>
            <span className="chip bg-lilac text-white">{isSuperAdmin ? 'Super Admin' : 'Editor'}</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
