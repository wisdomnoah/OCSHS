import { useState } from 'react';
import { Loader2, Save, Eye, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useHomepageContent } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { SectionHeader, Field, useToast, Toast } from '../components';
import { navigate } from '@/lib/router';

export function AdminHomepage() {
  const { content, loading } = useHomepageContent();
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [busy, setBusy] = useState(false);

  const data = { ...content, ...form } as Record<string, string | number>;

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from('homepage_content').update(form).eq('id', 1);
    setBusy(false);
    if (error) show('Failed to save. Please try again.', 'error');
    else {
      show('Homepage updated successfully.');
      setForm({});
      if (user) {
        await supabase.from('audit_log').insert({
          action: 'update', entity_type: 'homepage_content', entity_id: '1', details: {},
        });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-lilac" /></div>;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} />}
      <SectionHeader
        title="Homepage"
        subtitle="Edit the main sections visitors see when they land on your site."
      />

      <div className="flex gap-3">
        <button onClick={save} disabled={busy || Object.keys(form).length === 0} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
        </button>
        <button onClick={() => navigate('/')} className="btn-ghost">
          <Eye className="h-4 w-4" /> Preview Site <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="card-glass p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-white">Hero Section</h3>
        <div className="space-y-4">
          <Field label="Hero Title"><input className="input" value={data.hero_title ?? ''} onChange={(e) => set('hero_title', e.target.value)} /></Field>
          <Field label="Hero Description"><textarea rows={3} className="input resize-none" value={data.hero_description ?? ''} onChange={(e) => set('hero_description', e.target.value)} /></Field>
          <Field label="Hero Image URL"><input className="input" value={data.hero_image_url ?? ''} onChange={(e) => set('hero_image_url', e.target.value)} /></Field>
          {data.hero_image_url && <img src={data.hero_image_url as string} alt="Hero preview" className="h-40 w-full rounded-xl border border-white/10 object-cover" />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero Button Text"><input className="input" value={data.hero_button_text ?? ''} onChange={(e) => set('hero_button_text', e.target.value)} /></Field>
            <Field label="Hero Button Link"><input className="input" value={data.hero_button_link ?? ''} onChange={(e) => set('hero_button_link', e.target.value)} placeholder="/about" /></Field>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="card-glass p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-white">About Section</h3>
        <div className="space-y-4">
          <Field label="About Title"><input className="input" value={data.about_title ?? ''} onChange={(e) => set('about_title', e.target.value)} /></Field>
          <Field label="About Description"><textarea rows={4} className="input resize-none" value={data.about_description ?? ''} onChange={(e) => set('about_description', e.target.value)} /></Field>
        </div>
      </div>

      {/* Principal Section */}
      <div className="card-glass p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-white">Principal's Message</h3>
        <div className="space-y-4">
          <Field label="Principal Name"><input className="input" value={data.principal_name ?? ''} onChange={(e) => set('principal_name', e.target.value)} /></Field>
          <Field label="Principal Message"><textarea rows={5} className="input resize-none" value={data.principal_message ?? ''} onChange={(e) => set('principal_message', e.target.value)} /></Field>
          <Field label="Principal Photo URL"><input className="input" value={data.principal_photo_url ?? ''} onChange={(e) => set('principal_photo_url', e.target.value)} /></Field>
          {data.principal_photo_url && <img src={data.principal_photo_url as string} alt="Principal preview" className="h-32 w-32 rounded-xl border border-white/10 object-cover" />}
        </div>
      </div>

      {/* Stats */}
      <div className="card-glass p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-white">School Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Students"><input type="number" className="input" value={data.stat_students ?? 0} onChange={(e) => set('stat_students', Number(e.target.value))} /></Field>
          <Field label="Teachers"><input type="number" className="input" value={data.stat_teachers ?? 0} onChange={(e) => set('stat_teachers', Number(e.target.value))} /></Field>
          <Field label="Graduating Sets"><input type="number" className="input" value={data.stat_graduating_sets ?? 0} onChange={(e) => set('stat_graduating_sets', Number(e.target.value))} /></Field>
        </div>
      </div>
    </div>
  );
}
