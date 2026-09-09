import { useEffect, useRef, useState } from 'react';
import { Target, Eye, Compass, Shirt, ArrowRight, UserCircle } from 'lucide-react';
import { navigate } from '@/lib/router';
import { useTimeline, useStaff } from '@/lib/hooks';
import { StateWrapper } from '@/components/StateWrapper';

const PILLARS = [
  { icon: Target, title: 'Our Mission', text: 'To nurture disciplined, knowledgeable and God-fearing young people who are prepared to serve their community and lead with integrity.' },
  { icon: Eye, title: 'Our Vision', text: 'To be a centre of academic and moral excellence in Surulere — producing graduates who are honest, obedient and hardworking.' },
  { icon: Shirt, title: 'Dress Code & Values', text: 'Full school uniform is mandatory. We uphold punctuality, respect for elders and peers, cleanliness, and a strong work ethic in every student.' },
];

export function AboutPage() {
  const { data: milestones, loading, error } = useTimeline();
  const { data: staff } = useStaff();
  const [active, setActive] = useState(0);

  useEffect(() => { if (milestones.length) setActive(0); }, [milestones.length]);

  const activeMilestone = milestones[active];
  const leadership = staff.filter((s) => s.department === 'Administration');

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="section-eyebrow"><Compass className="h-3.5 w-3.5" /> About OCSHS</span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Four decades of <span className="text-lilac-300">community</span> and excellence.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream/70 sm:text-lg">
            Established in 1981, Obele Community Senior High School has proudly produced
            39 sets of graduating alumni — building character and knowledge in the heart of Surulere, Lagos.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <article key={p.title} className="card-glass p-7 animate-fadeUp" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-lilac/30 bg-lilac/10">
                <p.icon className="h-5 w-5 text-lilac-300" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/65">{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="section-eyebrow justify-center"><Target className="h-3.5 w-3.5" /> Our Journey</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">1981 to today</h2>
          <p className="mt-2 text-sm text-cream/60">Click any milestone to explore the moment that shaped OCSHS.</p>
        </div>

        <StateWrapper loading={loading} error={error}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-lilac/50 via-white/15 to-transparent" />
              <div className="space-y-2">
                {milestones.map((m, i) => {
                  const isActive = i === active;
                  return (
                    <button key={m.id} onClick={() => setActive(i)}
                      className={`group relative flex w-full items-center gap-5 rounded-2xl p-3 text-left transition-all duration-200 ${isActive ? 'glass border-lilac/30' : 'hover:bg-white/5'}`}>
                      <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 ${isActive ? 'border-lilac bg-lilac/20 text-lilac-300' : 'border-white/15 bg-ink-900 text-cream/50 group-hover:border-lilac/50'}`}>
                        {isActive && <span className="absolute inset-0 animate-ping rounded-full border border-lilac/50" />}
                      </span>
                      <span className="flex-1">
                        <span className={`block font-display text-sm font-semibold transition ${isActive ? 'text-white' : 'text-cream/70'}`}>{m.year}</span>
                        <span className={`block text-xs transition ${isActive ? 'text-lilac-300' : 'text-cream/40'}`}>{m.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:sticky lg:top-24">
              {activeMilestone && (
                <div key={activeMilestone.id} className="card-glass relative overflow-hidden p-8 animate-fadeUp">
                  <p className="font-display text-6xl font-bold text-lilac-300">{activeMilestone.year}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-white">{activeMilestone.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-cream/70">{activeMilestone.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-cream/40">
                    <span className="text-lilac-300">{active + 1}</span><span>/</span><span>{milestones.length}</span>
                    <span className="ml-auto flex gap-2">
                      <button onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs transition hover:border-lilac/40 hover:text-lilac-300 disabled:opacity-30">Prev</button>
                      <button onClick={() => setActive((a) => Math.min(milestones.length - 1, a + 1))} disabled={active === milestones.length - 1}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs transition hover:border-lilac/40 hover:text-lilac-300 disabled:opacity-30">Next</button>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </StateWrapper>
      </section>

      {/* Leadership */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="section-eyebrow justify-center"><UserCircle className="h-3.5 w-3.5" /> Leadership</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Meet our school leaders</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {leadership.map((s) => (
            <article key={s.id} className="card-glass flex items-start gap-5 p-6">
              {s.photo_url ? (
                <img src={s.photo_url} alt={s.name} className="h-20 w-20 shrink-0 rounded-2xl border border-lilac/30 object-cover" />
              ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-white/10 bg-ink-800">
                  <UserCircle className="h-10 w-10 text-cream/30" />
                </div>
              )}
              <div>
                <span className="chip border-lilac/40 bg-lilac/10 text-lilac-300">{s.role}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-white">{s.name}</h3>
                {s.bio && <p className="mt-1.5 text-sm leading-relaxed text-cream/60">{s.bio}</p>}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <button onClick={() => navigate('/staff')} className="btn-ghost">See all staff <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </div>
  );
}
