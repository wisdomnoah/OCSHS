import { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/lib/hooks';

export function ContactPage() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const contacts = [
    { icon: MapPin, label: 'Visit', value: settings?.address ?? '82, Randle Avenue, Surulere, Lagos, Nigeria' },
    { icon: Phone, label: 'Call', value: settings?.phone ?? '08150820178' },
    { icon: Mail, label: 'Email', value: settings?.email ?? 'obelesenior@gmail.com' },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name, email: form.email, subject: form.subject, message: form.message,
    });
    if (error) { setStatus('error'); setErrorMsg('Something went wrong. Please try again.'); }
    else { setStatus('sent'); setForm({ name: '', email: '', subject: 'General Inquiry', message: '' }); }
  };

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="section-eyebrow"><Mail className="h-3.5 w-3.5" /> Contact & Support</span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Let's <span className="text-lilac-300">connect</span>.</h1>
          <p className="mt-4 max-w-2xl text-base text-cream/70">Questions, inquiries, or messages — we'd love to hear from you. Your message goes straight to {settings?.email ?? 'obelesenior@gmail.com'}.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {contacts.map((c) => (
            <div key={c.label} className="card-glass flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-lilac"><c.icon className="h-5 w-5 text-white" /></span>
              <div><p className="text-xs uppercase tracking-wider text-cream/40">{c.label}</p><p className="text-sm font-medium text-white">{c.value}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Send us a message</h2>
            <p className="mt-2 text-sm text-cream/60">We typically respond within two school days.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your name" /></div>
                <div><label className="label">Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@email.com" /></div>
              </div>
              <div>
                <label className="label">Subject</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input">
                  <option>General Inquiry</option><option>Admissions</option><option>PTA / Parent Matter</option><option>Alumni</option><option>Other</option>
                </select>
              </div>
              <div><label className="label">Message</label><textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input resize-none" placeholder="How can we help?" /></div>
              {status === 'sent' && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald px-4 py-3 text-sm text-emerald"><CheckCircle2 className="h-4 w-4" /> Message received — thank you!</div>
              )}
              {status === 'error' && (
                <div className="rounded-xl bg-red-500 px-4 py-3 text-sm text-white">{errorMsg || 'Something went wrong. Please try again.'}</div>
              )}
              <button type="submit" disabled={status === 'sending'} className="btn-primary"><Send className="h-4 w-4" />{status === 'sending' ? 'Sending…' : 'Send message'}</button>
            </form>
          </div>

          <div>
            <span className="section-eyebrow"><MessageSquare className="h-3.5 w-3.5" /> School Office</span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-white">Reach the school directly</h2>
            <p className="mt-2 text-sm text-cream/60">For urgent matters, call or visit the school office during school hours ({settings?.opening_hours ?? '8:00am – 3:00pm, Monday to Friday'}).</p>
            <div className="card-glass mt-6 space-y-4 p-6">
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-lilac-300" /><div><p className="text-sm font-medium text-white">Address</p><p className="text-sm text-cream/60">{settings?.address ?? '82, Randle Avenue, Surulere, Lagos, Nigeria'}</p></div></div>
              <div className="flex items-start gap-3"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-lilac-300" /><div><p className="text-sm font-medium text-white">Phone</p><p className="text-sm text-cream/60">{settings?.phone ?? '08150820178'}</p></div></div>
              <div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-lilac-300" /><div><p className="text-sm font-medium text-white">Email</p><a href={`mailto:${settings?.email ?? 'obelesenior@gmail.com'}`} className="text-sm text-cream/60 transition hover:text-lilac-300">{settings?.email ?? 'obelesenior@gmail.com'}</a></div></div>
            </div>
            <div className="card-glass mt-4 p-6">
              <p className="font-display text-base font-semibold text-white">School motto</p>
              <p className="mt-1 font-display text-lg text-lilac-300">{settings?.motto ?? 'Honesty · Obedience · Hard Work'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
