import { useMemo, useState } from 'react';
import { CalendarDays, MapPin, Megaphone, Pin, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAnnouncements, useEvents } from '@/lib/hooks';
import { PRIORITY_META, EVENT_CATEGORY_META, type EventCategory } from '@/lib/types';
import { StateWrapper, EmptyState } from '@/components/StateWrapper';
import { useCountdown } from '@/lib/anim';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FILTERS: ({ key: EventCategory | 'all'; label: string })[] = [
  { key: 'all', label: 'All' },
  { key: 'academic', label: 'Academic' },
  { key: 'exam', label: 'Exams' },
  { key: 'sports', label: 'Sports' },
  { key: 'arts', label: 'Arts' },
  { key: 'community', label: 'Community' },
];

export function AnnouncementsPage() {
  const { data: announcements, loading: al, error: ae } = useAnnouncements();
  const { data: events, loading: el, error: ee } = useEvents();
  const [filter, setFilter] = useState<EventCategory | 'all'>('all');
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredEvents = useMemo(
    () => (filter === 'all' ? events : events.filter((e) => e.category === filter)),
    [events, filter]
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    filteredEvents.forEach((e) => {
      if (!map.has(e.event_date)) map.set(e.event_date, []);
      map.get(e.event_date)!.push(e);
    });
    return map;
  }, [filteredEvents]);

  const calendarCells = useMemo(() => {
    const y = cursor.getFullYear(), m = cursor.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];
  const pinned = announcements.filter((a) => a.is_pinned);
  const rest = announcements.filter((a) => !a.is_pinned);
  const nextEvent = filteredEvents.find((e) => new Date(e.event_date).getTime() > Date.now());

  const monthLabel = cursor.toLocaleString('en', { month: 'long', year: 'numeric' });

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="section-eyebrow"><CalendarDays className="h-3.5 w-3.5" /> Announcements & Events</span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
            Stay in the <span className="text-lilac-300">loop</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-cream/70">Every notice, every event, every milestone — all in one place.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Countdown to next event */}
        {nextEvent && <CountdownBanner event={nextEvent} />}

        {/* Event category filter */}
        <div className="mb-8 mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`chip transition-all duration-200 ${filter === f.key ? 'bg-lilac text-white' : 'bg-surface-2 text-cream/60 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Calendar */}
          <div className="card-glass p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-white">{monthLabel}</h2>
              <div className="flex gap-2">
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-lilac hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-lilac hover:text-white"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>

            <StateWrapper loading={el} error={ee}>
              <>
                <div className="mb-2 grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map((d) => <div key={d} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-cream/40">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarCells.map((date, i) => {
                    if (!date) return <div key={i} className="aspect-square" />;
                    const key = date.toISOString().slice(0, 10);
                    const dayEvents = eventsByDate.get(key) ?? [];
                    const isToday = key === new Date().toISOString().slice(0, 10);
                    const isSelected = key === selectedDate;
                    return (
                      <button key={i} onClick={() => setSelectedDate(key)}
                        className={`group relative flex aspect-square flex-col items-center justify-start rounded-xl p-1.5 transition-all duration-200 ${isSelected ? 'bg-lilac text-white' : isToday ? 'bg-emerald text-emerald' : 'bg-surface hover:bg-surface-2'}`}>
                        <span className={`text-sm ${isToday ? 'font-bold text-emerald' : 'text-cream/80'}`}>{date.getDate()}</span>
                        {dayEvents.length > 0 && (
                          <span className="mt-auto mb-1 flex gap-0.5">{dayEvents.slice(0, 3).map((_, idx) => <span key={idx} className="h-1 w-1 rounded-full bg-lilac" />)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 border-t border-white/10 pt-5">
                  {selectedDate ? (
                    selectedEvents.length ? (
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-wider text-cream/50">{new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        {selectedEvents.map((e) => <EventRow key={e.id} event={e} />)}
                      </div>
                    ) : <p className="text-sm text-cream/40">No events on {new Date(selectedDate).toLocaleDateString('en', { month: 'long', day: 'numeric' })}.</p>
                  ) : <p className="text-sm text-cream/40">Select a date to see what's planned.</p>}
                </div>
              </>
            </StateWrapper>
          </div>

          {/* Announcements list */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-lilac-300" />
              <h2 className="font-display text-xl font-semibold text-white">All Announcements</h2>
            </div>
            <StateWrapper loading={al} error={ae} empty={announcements.length === 0 ? <EmptyState message="No announcements yet." /> : undefined}>
              <div className="space-y-3">
                {pinned.length > 0 && <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-lilac-300">Pinned</div>}
                {pinned.map((a) => <AnnouncementCard key={a.id} a={a} />)}
                {rest.length > 0 && pinned.length > 0 && <div className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-cream/40">Recent</div>}
                {rest.map((a) => <AnnouncementCard key={a.id} a={a} />)}
              </div>
            </StateWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}

function CountdownBanner({ event }: { event: import('@/lib/types').SchoolEvent }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(event.event_date);
  const meta = EVENT_CATEGORY_META[event.category as EventCategory];
  return (
    <div className="card-glass relative overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="section-eyebrow"><Clock className="h-3.5 w-3.5" /> Next Event</span>
          <h3 className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">{event.title}</h3>
          <p className="mt-1 text-sm text-cream/60">{new Date(event.event_date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}{event.location ? ` · ${event.location}` : ''}</p>
          <span className={`chip mt-3 ${meta.color}`}>{meta.label}</span>
        </div>
        <div className="flex gap-3">
          {expired ? (
            <div className="rounded-xl bg-surface-2 px-5 py-3 text-sm text-cream/60">Happening now</div>
          ) : (
            <>
              <CountdownUnit value={days} label="Days" />
              <CountdownUnit value={hours} label="Hrs" />
              <CountdownUnit value={minutes} label="Min" />
              <CountdownUnit value={seconds} label="Sec" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="grid place-items-center rounded-xl bg-lilac px-3 py-2 sm:px-4">
      <span className="font-display text-2xl font-semibold text-white tabular-nums">{String(value).padStart(2, '0')}</span>
      <span className="text-[10px] uppercase tracking-wider text-white/70">{label}</span>
    </div>
  );
}

function AnnouncementCard({ a }: { a: import('@/lib/types').Announcement }) {
  const meta = PRIORITY_META[a.priority];
  return (
    <article className="card-glass p-5">
      <div className="flex items-center gap-2">
        <span className={`chip ${meta.color}`}>{meta.label}</span>
        {a.is_pinned && <Pin className="h-3.5 w-3.5 text-lilac-300" />}
        <span className="ml-auto text-xs text-cream/40">{new Date(a.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
      </div>
      <h3 className="mt-3 font-display text-base font-medium text-white">{a.title}</h3>
      {a.body && <p className="mt-1.5 text-sm leading-relaxed text-cream/65">{a.body}</p>}
    </article>
  );
}

function EventRow({ event }: { event: import('@/lib/types').SchoolEvent }) {
  const meta = EVENT_CATEGORY_META[event.category as EventCategory];
  return (
    <div className="card-glass flex items-start gap-3 p-4">
      <span className={`chip shrink-0 ${meta.color}`}>{meta.label}</span>
      <div className="min-w-0">
        <p className="font-medium text-white">{event.title}</p>
        {event.description && <p className="mt-0.5 text-sm text-cream/60">{event.description}</p>}
        {event.location && <p className="mt-1 flex items-center gap-1 text-xs text-cream/40"><MapPin className="h-3 w-3" /> {event.location}</p>}
      </div>
    </div>
  );
}
