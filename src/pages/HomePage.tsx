import { useMemo } from 'react';
import {
  ArrowRight, Sparkles, Trophy, Users, GraduationCap, CalendarDays, Megaphone, Pin,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useAnnouncements, useEvents, useGallery, useAwards, useHomepageContent, useSiteSettings } from '@/lib/hooks';
import { PRIORITY_META } from '@/lib/types';
import { StateWrapper } from '@/components/StateWrapper';
import { WalkingStudents } from '@/components/WalkingStudents';
import { useCountUp } from '@/lib/anim';

export function HomePage() {
  const { data: announcements, loading, error } = useAnnouncements();
  const { data: events } = useEvents();
  const { data: gallery } = useGallery();
  const { data: awards } = useAwards();
  const { content: hero } = useHomepageContent();
  const { settings } = useSiteSettings();

  const tickerText = useMemo(
    () => announcements.slice(0, 6).map((a) => a.title).join('   •   '),
    [announcements]
  );
  const featuredImage = gallery.find((g) => g.category === 'campus') ?? gallery[0];
  const upcoming = events.slice(0, 3);
  const recentAward = awards[0];

  const heroImg = hero?.hero_image_url ?? 'https://images.pexels.com/photos/6209356/pexels-photo-6209356.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
  const motto = settings?.motto ?? 'Honesty, Obedience, and Hard Work';

  return (
    <div className="pt-16">
      {/* HERO */}
      <section className="relative overflow-hidden">


        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fadeUp">
              <span className="section-eyebrow">
                <Sparkles className="h-3.5 w-3.5" /> Welcome to {settings?.school_short ?? 'Obele Community SHS'}
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {hero?.hero_title ?? 'Where curiosity becomes mastery.'}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/70 sm:text-lg">
                {hero?.hero_description ?? `A community of curiosity, character, and excellence in Surulere, Lagos — empowering students since 1981 with ${motto}.`}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => navigate(hero?.hero_button_link ?? '/about')} className="btn-primary">
                  {hero?.hero_button_text ?? 'Discover OCSHS'} <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/programs')} className="btn-secondary">
                  Explore Programs
                </button>
              </div>

              {/* Animated stat counters */}
              <div className="mt-12 grid grid-cols-3 gap-3">
                <StatCounter icon={Users} target={hero?.stat_students ?? 804} label="Students" />
                <StatCounter icon={GraduationCap} target={hero?.stat_teachers ?? 26} label="Teachers" />
                <StatCounter icon={Trophy} target={hero?.stat_graduating_sets ?? 39} label="Graduating Sets" />
              </div>
            </div>

            {/* Hero image + walking students */}
            <div className="relative animate-fadeUp [animation-delay:150ms]">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <img src={heroImg} alt="OCSHS students walking to class" className="h-[420px] w-full object-cover sm:h-[480px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                <WalkingStudents className="h-20 opacity-90" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="glass-strong rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-wider text-lilac-300">Campus Life</p>
                    <p className="mt-1 font-display text-lg text-white">{featuredImage?.title ?? 'Obele Community SHS'}</p>
                  </div>
                </div>
              </div>

              <FloatingAnnouncement className="-left-6 top-10 hidden animate-floatY sm:block"
                icon={<Megaphone className="h-4 w-4 text-lilac-300" />} title="Announcements"
                subtitle={`${announcements.filter((a) => a.is_pinned).length} pinned`} />
              <FloatingAnnouncement className="-right-4 bottom-24 hidden animate-floatY [animation-delay:1.5s] sm:block"
                icon={<Trophy className="h-4 w-4 text-emerald" />} title="Debate Champions" subtitle="Lagos State 2024" />
            </div>
          </div>
        </div>

        {/* Motto banner */}
        <div className="relative border-y border-white/10 bg-ink-900/40 py-5 text-center backdrop-blur">
          <p className="font-display text-lg font-semibold tracking-wide text-white sm:text-xl">
            <span className="text-lilac-300">Honesty</span> · <span className="text-emerald">Obedience</span> · <span className="text-lilac-300">Hard Work</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-cream/40">Our School Motto</p>
        </div>

        {/* Ticker */}
        <div className="relative border-b border-white/10 bg-ink-900/40 py-3 backdrop-blur">
          <div className="flex items-center overflow-hidden">
            <span className="flex shrink-0 items-center gap-2 border-r border-white/10 px-5 text-xs font-semibold uppercase tracking-wider text-lilac-300">
              <Pin className="h-3.5 w-3.5" /> Live
            </span>
            <div className="relative flex-1 overflow-hidden">
              <div className="whitespace-nowrap text-sm text-cream/70 animate-marquee">
                <span className="px-4">{tickerText || 'Welcome to Obele Community Senior High School (OCSHS).'}</span>
                <span className="px-4">{tickerText || 'Welcome to Obele Community Senior High School (OCSHS).'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS + UPCOMING EVENTS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <span className="section-eyebrow"><Megaphone className="h-3.5 w-3.5" /> Latest Announcements</span>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">What's happening at OCSHS</h2>
              </div>
              <button onClick={() => navigate('/announcements')} className="link-underline hidden text-sm text-cream/70 sm:inline">View all</button>
            </div>

            <StateWrapper loading={loading} error={error}>
              <div className="space-y-3">
                {announcements.slice(0, 5).map((a) => {
                  const meta = PRIORITY_META[a.priority];
                  return (
                    <article key={a.id} className="card-glass flex items-start gap-4 p-5">
                      <span className={`chip shrink-0 ${meta.color}`}>{meta.label}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base font-medium text-white">{a.title}</h3>
                        {a.body && <p className="mt-1 line-clamp-2 text-sm text-cream/60">{a.body}</p>}
                      </div>
                      {a.is_pinned && <Pin className="mt-1 h-4 w-4 shrink-0 text-lilac-300" />}
                    </article>
                  );
                })}
              </div>
            </StateWrapper>
          </div>

          <div>
            <div className="mb-6">
              <span className="section-eyebrow"><CalendarDays className="h-3.5 w-3.5" /> Upcoming</span>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">Next on the calendar</h2>
            </div>
            <div className="space-y-3">
              {upcoming.map((e) => {
                const d = new Date(e.event_date);
                return (
                  <button key={e.id} onClick={() => navigate('/announcements')} className="card-glass flex w-full items-center gap-4 p-4 text-left">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-lilac">
                      <span className="font-display text-lg font-semibold text-white">{d.getDate()}</span>
                      <span className="text-[10px] uppercase text-white/70">{d.toLocaleString('en', { month: 'short' })}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{e.title}</p>
                      <p className="truncate text-xs text-cream/50">{e.location}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-cream/40" />
                  </button>
                );
              })}
              {upcoming.length === 0 && <div className="card-glass p-6 text-center text-sm text-cream/50">No upcoming events.</div>}
            </div>

            {recentAward && (
              <div className="card-glass mt-6 p-5">
                <span className="section-eyebrow"><Trophy className="h-3.5 w-3.5" /> Latest Win</span>
                <h3 className="mt-2 font-display text-lg text-white">{recentAward.title}</h3>
                <p className="mt-1 text-sm text-cream/60">{recentAward.recipient}</p>
                <button onClick={() => navigate('/awards')} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-lilac-300">
                  See all awards <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCounter({ icon: Icon, target, label }: { icon: typeof Users; target: number; label: string }) {
  const { value, ref } = useCountUp(target);
  return (
    <div className="card-glass group p-4">
      <Icon className="mb-2 h-5 w-5 text-lilac-300 transition-transform group-hover:scale-110" />
      <div className="font-display text-2xl font-semibold text-white sm:text-3xl">
        <span ref={ref}>{value.toLocaleString()}</span>
      </div>
      <div className="text-xs text-cream/50">{label}</div>
    </div>
  );
}

function FloatingAnnouncement({ className, icon, title, subtitle }: { className?: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className={`absolute z-10 ${className}`}>
      <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-cream/60">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
