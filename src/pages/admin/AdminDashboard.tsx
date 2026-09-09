import { useEffect, useState } from 'react';
import {
  Megaphone, CalendarDays, Images, Users, FileText, Mail,
  TrendingUp, Clock, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type Section = 'dashboard' | 'homepage' | 'about' | 'principal' | 'announcements' | 'events' | 'gallery' | 'academics' | 'staff' | 'admissions' | 'contact' | 'pages' | 'media' | 'users' | 'settings' | 'audit';

interface Stats {
  announcements: number;
  events: number;
  gallery: number;
  staff: number;
  pages: number;
  messages: number;
  upcomingEvents: number;
}

export function AdminDashboard({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [ann, evt, gal, stf, pg, msg, upcoming] = await Promise.all([
        supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('gallery_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('staff').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('pages').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('event_date', today),
      ]);
      setStats({
        announcements: ann.count ?? 0,
        events: evt.count ?? 0,
        gallery: gal.count ?? 0,
        staff: stf.count ?? 0,
        pages: pg.count ?? 0,
        messages: msg.count ?? 0,
        upcomingEvents: upcoming.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: 'Announcements', value: stats?.announcements, icon: Megaphone, section: 'announcements' as Section, color: 'text-lilac-300 bg-lilac/10 border-lilac/30' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents, icon: Clock, section: 'events' as Section, color: 'text-emerald-300 bg-emerald/10 border-emerald/30' },
    { label: 'Gallery Images', value: stats?.gallery, icon: Images, section: 'gallery' as Section, color: 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30' },
    { label: 'Staff Members', value: stats?.staff, icon: Users, section: 'staff' as Section, color: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
    { label: 'Published Pages', value: stats?.pages, icon: FileText, section: 'pages' as Section, color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' },
    { label: 'Messages', value: stats?.messages, icon: Mail, section: 'contact' as Section, color: 'text-red-300 bg-red-500/10 border-red-500/30' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-cream/60">Welcome back{user?.email ? `, ${user.email}` : ''}. Here's what's happening on your site.</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.section)}
            className="card-glass group flex items-center gap-4 p-5 text-left"
          >
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-cream/60">{card.label}</p>
              <p className="font-display text-2xl font-semibold text-white">
                {loading ? '…' : (card.value ?? 0)}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-cream/30 transition group-hover:translate-x-1 group-hover:text-lilac-300" />
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card-glass p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-lilac-300" />
          <h2 className="font-display text-lg font-semibold text-white">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate('announcements')} className="btn-primary">
            <Megaphone className="h-4 w-4" /> New Announcement
          </button>
          <button onClick={() => onNavigate('events')} className="btn-secondary">
            <CalendarDays className="h-4 w-4" /> Add Event
          </button>
          <button onClick={() => onNavigate('homepage')} className="btn-ghost">
            Edit Homepage
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="card-glass p-6">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald" />
          <h2 className="font-display text-lg font-semibold text-white">Site Status</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusRow label="Published announcements" value={stats?.announcements ?? '…'} />
          <StatusRow label="Upcoming events" value={stats?.upcomingEvents ?? '…'} />
          <StatusRow label="Total events" value={stats?.events ?? '…'} />
          <StatusRow label="Gallery images" value={stats?.gallery ?? '…'} />
          <StatusRow label="Staff members" value={stats?.staff ?? '…'} />
          <StatusRow label="Published pages" value={stats?.pages ?? '…'} />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3">
      <span className="text-sm text-cream/60">{label}</span>
      <span className="font-display text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
