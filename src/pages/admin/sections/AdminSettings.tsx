import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { SectionHeader, Field, useToast, Toast } from '../components';
import type { SiteSettings } from '@/lib/types';

export function AdminSettings() {
  const { settings, loading } = useSiteSettings();
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [busy, setBusy] = useState(false);

  const data = { ...settings, ...form } as SiteSettings;

  useEffect(() => { if (settings) setForm({}); }, [settings]);

  const set = (k: keyof SiteSettings, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from('site_settings').update(form).eq('id', 1);
    setBusy(false);
    if (error) show('Failed to save settings.', 'error');
    else {
      show('Settings saved successfully.');
      if (user) {
        await supabase.from('audit_log').insert({ action: 'update', entity_type: 'site_settings', entity_id: '1', details: {} });
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-lilac" /></div>;

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} />}
      <SectionHeader title="School Information" subtitle="Update contact details, motto, mission, and social links shown across the site." />

      <button onClick={save} disabled={busy || Object.keys(form).length === 0} className="btn-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
      </button>

      {/* Basic info */}
      <div className="card-glass p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-white">School Identity</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="School Name"><input className="input" value={data.school_name ?? ''} onChange={(e) => set('school_name', e.target.value)} /></Field>
          <Field label="Short Name"><input className="input" value={data.school_short ?? ''} onChange={(e) => set('school_short', e.target.value)} /></Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Motto"><input className="input" value={data.motto ?? ''} onChange={(e) => set('motto', e.target.value)} /></Field>
          <Field label="Mission"><textarea rows={3} className="input resize-none" value={data.mission ?? ''} onChange={(e) => set('mission', e.target.value)} /></Field>
          <Field label="Vision"><textarea rows={3} className="input resize-none" value={data.vision ?? ''} onChange={(e) => set('vision', e.target.value)} /></Field>
        </div>
      </div>

      {/* Contact info */}
      <div className="card-glass p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-white">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Address"><input className="input" value={data.address ?? ''} onChange={(e) => set('address', e.target.value)} /></Field>
          <Field label="Phone"><input className="input" value={data.phone ?? ''} onChange={(e) => set('phone', e.target.value)} /></Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Email"><input className="input" value={data.email ?? ''} onChange={(e) => set('email', e.target.value)} /></Field>
          <Field label="Opening Hours"><input className="input" value={data.opening_hours ?? ''} onChange={(e) => set('opening_hours', e.target.value)} /></Field>
        </div>
      </div>

      {/* Logo & social */}
      <div className="card-glass p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-white">Logo & Social Media</h3>
        <Field label="Logo URL"><input className="input" value={data.logo_url ?? ''} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://…" /></Field>
        {data.logo_url && <img src={data.logo_url} alt="Logo preview" className="mt-2 h-20 w-20 rounded-xl border border-white/10 object-contain" />}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Facebook URL"><input className="input" value={data.facebook_url ?? ''} onChange={(e) => set('facebook_url', e.target.value)} placeholder="https://facebook.com/…" /></Field>
          <Field label="Instagram URL"><input className="input" value={data.instagram_url ?? ''} onChange={(e) => set('instagram_url', e.target.value)} placeholder="https://instagram.com/…" /></Field>
          <Field label="Twitter / X URL"><input className="input" value={data.twitter_url ?? ''} onChange={(e) => set('twitter_url', e.target.value)} placeholder="https://x.com/…" /></Field>
        </div>
      </div>
    </div>
  );
}
