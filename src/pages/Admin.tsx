import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, auth } from '../lib/localApi';
import { ArrowDown, ArrowUp, Loader2, LogOut, Plus, Trash2 } from 'lucide-react';
import { DEFAULTS, merge } from '../lib/contentStore';
import AdminsPanel from '../components/AdminsPanel';

type Json = any;
type Ctx = { urls: Record<string, string>; setUrl: (p: string, u: string) => void; services: { id: string; name: string }[] };

const PATTERNS = ['plaits', 'box', 'cornrows', 'twists', 'locs', 'fulani', 'natural'];
const TEMPLATES: Record<string, Json> = { testimonials: { name: '', text: '', rating: 5 } };
const TABS: Record<string, string[]> = {
  Photos: [],
  'Business details': ['site'],
  Services: ['services'],
  Gallery: ['gallery'],
  FAQs: ['faqs'],
  Testimonials: ['testimonials'],
  'Home page': ['copy.home'],
  'About page': ['copy.about'],
  'Services & Gallery text': ['copy.services', 'copy.gallery'],
  'Booking & Contact text': ['copy.booking', 'copy.contact'],
  'Legal pages': ['copy.privacy', 'copy.terms'],
  Bookings: [],
  Admins: [],
};

const human = (k: string) => {
  if (k === 'q') return 'Question';
  if (k === 'a') return 'Answer';
  if (k === 'from') return 'Starting price';
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
};
const blank = (v: Json): Json =>
  Array.isArray(v) ? [] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : '';
const setIn = (o: Json, p: string[], v: Json): Json => (p.length ? { ...o, [p[0]]: setIn(o[p[0]], p.slice(1), v) } : v);
const getIn = (o: Json, p: string[]): Json => p.reduce((a, k) => a?.[k], o);

const shrink = (f: File) =>
  new Promise<{ data: string; contentType: string }>((res, rej) => {
    const img = new Image();
    const u = URL.createObjectURL(f);
    img.onload = () => {
      const s = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u);
      const contentType = ['image/png', 'image/webp'].includes(f.type) ? f.type : 'image/jpeg';
      const encoded = c.toDataURL(contentType, 0.85);
      res({ data: encoded.split(',')[1], contentType: encoded.slice(5, encoded.indexOf(';')) });
    };
    img.onerror = () => rej(new Error('bad image'));
    img.src = u;
  });

const encodeVideo = (file: File) => new Promise<{ data: string; contentType: string }>((resolve, reject) => {
  if (file.size > 2_800_000) {
    reject(new Error('Videos must be 2.8 MB or smaller.'));
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result ?? '');
    const comma = result.indexOf(',');
    if (comma < 0) reject(new Error('Could not read this video.'));
    else resolve({ data: result.slice(comma + 1), contentType: file.type });
  };
  reader.onerror = () => reject(new Error('Could not read this video.'));
  reader.readAsDataURL(file);
});

function ImageField({ value, onChange, ctx, label = 'image' }: { value: string; onChange: (v: string) => void; ctx: Ctx; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const isLogo = /logo/i.test(label);
  const isVideo = /\.(mp4|webm)(?:$|[?#])/i.test(value);
  const url = value ? (/^(https?:|\/)/.test(value) ? value : ctx.urls[value] ?? '') : '';
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setErr('');
    try {
      const { data, contentType } = f.type.startsWith('video/') ? await encodeVideo(f) : await shrink(f);
      if (data.length > 4000000) throw new Error('File is too large. Choose a smaller image or video.');
      const { data: r } = await api.post('/api/admin/upload', { data, contentType });
      ctx.setUrl(r.path, r.url);
      onChange(r.path);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Upload failed. Try a smaller file.');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-4">
      {url ? isVideo ? <video src={url} controls muted playsInline preload="metadata" aria-label={`${label} preview`} className="h-24 w-40 rounded bg-night object-contain" /> : <img src={url} alt={`${label} preview`} className={`rounded ${isLogo ? 'h-16 w-40 bg-white p-1 object-contain' : 'h-24 w-24 object-cover'}`} /> : <div className={`flex items-center justify-center rounded border border-dashed border-gold/40 text-xs text-ink/50 ${isLogo ? 'h-16 w-40' : 'h-24 w-24'}`}>No media uploaded</div>}
      <div className="space-y-2">
        <label className="btn-ghost cursor-pointer !min-h-[40px] !px-4 !text-xs">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{value ? 'Replace media' : 'Upload media'}
          <input type="file" accept={isLogo ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,video/mp4,video/webm'} className="sr-only" onChange={pick} disabled={busy} />
        </label>
        {!isLogo && <p className="text-xs text-ink/50">Photos or MP4/WebM videos up to 2.8 MB.</p>}
        {value && <button type="button" onClick={() => onChange('')} className="block text-xs text-ink/60 underline">Remove media</button>}
        {err && <p className="err">{err}</p>}
      </div>
    </div>
  );
}

function ServiceImagesField({ value, onChange, ctx, label }: { value: string[]; onChange: (images: string[]) => void; ctx: Ctx; label: string }) {
  const photos = Array.from({ length: 3 }, (_, index) => value[index] ?? '');
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {photos.map((photo, index) => (
        <div key={index} className="space-y-2 border border-gold/15 p-3">
          <p className="text-xs font-medium text-ink/70">Photo {index + 1} of 3</p>
          <ImageField label={`${label} photo ${index + 1}`} value={photo} onChange={(next) => onChange(photos.map((current, slot) => slot === index ? next : current))} ctx={ctx} />
        </div>
      ))}
    </div>
  );
}

function PhotosPanel({ content, ctx, update }: { content: Json; ctx: Ctx; update: (path: string[], value: Json) => void }) {
  const field = (label: string, path: string, note?: string) => {
    const segments = path.split('.');
    return (
      <div key={path} className="space-y-2 border border-gold/25 bg-surface p-4">
        <div>
          <h3 className="font-medium text-plum">{label}</h3>
          {note && <p className="mt-1 text-xs text-ink/60">{note}</p>}
        </div>
        <ImageField label={label} value={String(getIn(content, segments) ?? '')} onChange={(value) => update(segments, value)} ctx={ctx} />
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-2xl text-plum">Brand and homepage</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('Logo', 'site.logoImage', 'Transparent PNG logos are supported.')}
          {field('Home hero photo', 'site.heroImage')}
          {field('Homepage about photo', 'copy.home.aboutImage')}
          {field('About page photo', 'copy.about.image')}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl text-plum">Service photos</h2>
        <div className="space-y-4">
          {content.services.map((service: Json, index: number) => (
            <div key={service.id ?? index} className="space-y-3 border border-gold/25 bg-surface p-4">
              <h3 className="font-medium text-plum">{service.name || `Service ${index + 1}`}</h3>
              <ServiceImagesField
                label={service.name || `Service ${index + 1}`}
                value={Array.isArray(service.images) ? service.images : service.image ? [service.image] : []}
                onChange={(images) => update(['services', String(index), 'images'], images)}
                ctx={ctx}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl text-plum">Gallery photos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {content.gallery.map((item: Json, index: number) => field(item.title || `Gallery photo ${index + 1}`, `gallery.${index}.image`))}
        </div>
      </section>
    </div>
  );
}

function Node({ label, value, onChange, ctx }: { label: string; value: Json; onChange: (v: Json) => void; ctx: Ctx }) {
  const showLabel = !/^\d+$/.test(label);
  if (label === 'images' && Array.isArray(value)) {
    return <ServiceImagesField value={value} onChange={onChange} ctx={ctx} label="Service" />;
  }
  if (Array.isArray(value)) {
    const tpl = value.length ? blank(value[0]) : TEMPLATES[label] ?? '';
    const swap = (i: number, j: number) => {
      if (j < 0 || j >= value.length) return;
      const n = [...value];
      [n[i], n[j]] = [n[j], n[i]];
      onChange(n);
    };
    return (
      <div className="space-y-3">
        {showLabel && <p className="label !mb-0">{human(label)}</p>}
        {value.map((it: Json, i: number) => (
          <div key={i} className="border border-gold/25 bg-night/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-serif text-lg text-plum">{(it && typeof it === 'object' && (it.name || it.title || it.q || it.days || it.heading)) || (typeof it === 'string' && it.slice(0, 40)) || `Item ${i + 1}`}</p>
              <div className="flex gap-1">
                <button type="button" aria-label="Move up" onClick={() => swap(i, i - 1)} className="p-2 text-ink/70 hover:text-plum"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" aria-label="Move down" onClick={() => swap(i, i + 1)} className="p-2 text-ink/70 hover:text-plum"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" aria-label="Remove item" onClick={() => window.confirm('Remove this item?') && onChange(value.filter((_: Json, k: number) => k !== i))} className="p-2 text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <Node label={String(i)} value={it} ctx={ctx} onChange={(x) => onChange(value.map((y: Json, k: number) => (k === i ? x : y)))} />
          </div>
        ))}
        <button type="button" onClick={() => onChange([...value, tpl && typeof tpl === 'object' && 'id' in tpl ? { ...tpl, id: `n${Date.now()}` } : tpl])} className="btn-ghost !min-h-[40px] !px-4 !text-xs"><Plus className="h-4 w-4" />Add {human(label).toLowerCase()} item</button>
      </div>
    );
  }
  if (value && typeof value === 'object') {
    return (
      <div className="space-y-4">
        {Object.keys(value).filter((k) => k !== 'id').map((k) => (
          <Node key={k} label={k} value={value[k]} ctx={ctx} onChange={(x) => onChange({ ...value, [k]: x })} />
        ))}
      </div>
    );
  }
  const id = `f-${label}-${Math.abs([...label].reduce((a, c) => a + c.charCodeAt(0), 0))}`;
  const lab = showLabel && <label htmlFor={id} className="label">{human(label)}</label>;
  if (typeof value === 'boolean') {
    return <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#C9A25C]" />{human(label)}</label>;
  }
  if (typeof value === 'number') {
    return <div>{lab}<input id={id} type="number" className="input" value={value} onChange={(e) => onChange(Number(e.target.value))} /></div>;
  }
  const text = String(value ?? '');
  if (/image$/i.test(label)) return <div>{lab}<ImageField label={human(label)} value={text} onChange={onChange} ctx={ctx} /></div>;
  if (label === 'pattern') return <div>{lab}<select id={id} className="input" value={text} onChange={(e) => onChange(e.target.value)}>{PATTERNS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>;
  if (label === 'service') return <div>{lab}<select id={id} className="input" value={text} onChange={(e) => onChange(e.target.value)}>{ctx.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>;
  if (text.length > 80 || text.includes('\n') || ['text', 'a', 'description', 'body1', 'body2', 'story'].includes(label)) {
    return <div>{lab}<textarea id={id} rows={3} className="input py-3" value={text} onChange={(e) => onChange(e.target.value)} /></div>;
  }
  return <div>{lab}<input id={id} className="input" value={text} onChange={(e) => onChange(e.target.value)} /></div>;
}

type Booking = { id: string; name: string; phone: string; email: string; serviceName: string; date: string; time: string; notes: string; status: string; createdAt: string };

function Bookings() {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/bookings');
      setRows(data.bookings);
    } catch {
      setErr('Could not load bookings.');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const setStatus = async (id: string, status: string) => {
    await api.put(`/api/admin/bookings/${id}`, { status });
    setRows((r) => r && r.map((b) => (b.id === id ? { ...b, status } : b)));
  };
  const del = async (id: string) => {
    if (!window.confirm('Delete this booking request?')) return;
    await api.delete(`/api/admin/bookings/${id}`);
    setRows((r) => r && r.filter((b) => b.id !== id));
  };
  if (err) return <p className="err">{err}</p>;
  if (!rows) return <p className="text-ink/70">Loading bookings…</p>;
  if (rows.length === 0) return <p className="text-ink/70">No booking requests yet. They will appear here as customers submit them.</p>;
  return (
    <ul className="space-y-4">
      {rows.map((b) => (
        <li key={b.id} className="border border-gold/25 bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-serif text-xl text-plum">{b.name}</p>
              <p className="text-sm"><a href={`tel:${b.phone}`} className="underline">{b.phone}</a>{b.email && <> · <a href={`mailto:${b.email}`} className="underline">{b.email}</a></>}</p>
              <p className="mt-1 text-sm text-ink/80">{b.serviceName} · {b.date} at {b.time}</p>
              {b.notes && <p className="mt-2 text-sm text-ink/70">Notes: {b.notes}</p>}
              <p className="mt-2 text-xs text-ink/50">Received {new Date(b.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`st-${b.id}`}>Status</label>
              <select id={`st-${b.id}`} className="input !w-auto" value={b.status} onChange={(e) => void setStatus(b.id, e.target.value)}>{['new', 'confirmed', 'declined', 'done'].map((s) => <option key={s} value={s}>{human(s)}</option>)}</select>
              <button type="button" aria-label="Delete booking" onClick={() => void del(b.id)} className="p-2 text-red-400"><Trash2 className="h-5 w-5" /></button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

type Phase = 'loading' | 'out' | 'denied' | 'ready';

export default function Admin() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [msg, setMsg] = useState('');
  const [content, setContent] = useState<Json>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [tab, setTab] = useState('Business details');
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { document.title = 'Admin | BRAIDY SALON'; }, []);

  const load = useCallback(async () => {
    const { data } = await api.get('/api/admin/content');
    const merged = merge(DEFAULTS, data.content);
    merged.services = merged.services.map((s: Json) => {
      const { image, ...service } = s;
      return { ...service, images: (Array.isArray(s.images) ? s.images : image ? [image] : []).filter(Boolean).slice(0, 3) };
    });
    merged.gallery = merged.gallery.map((g: Json) => ({ ...g, image: g.image ?? '' }));
    setContent(merged);
    setUrls(data.urls ?? {});
    setPhase('ready');
  }, []);

  const check = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/status');
      if (data.isAdmin) await load();
      else setPhase('out');
    } catch {
      await auth.signOut();
      setPhase('out');
    }
  }, [load]);

  useEffect(() => { void check(); }, [check]);

  const signIn = async () => {
    setMsg('');
    try {
      await auth.signIn(email, password);
      await check();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Sign-in was not completed.');
    }
  };
  const createAdmin = async () => {
    setMsg('');
    try {
      await auth.setup(email, password);
      await check();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not create the admin account.');
    }
  };
  const signOut = async () => { await auth.signOut(); setPhase('out'); setContent(null); };
  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/api/admin/content', { content });
      setMsg('Saved. Your changes are now live on the website.');
    } catch {
      setMsg('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const shell = (body: React.ReactNode) => (
    <div className="min-h-screen bg-night text-ink">
      <div className="wrap max-w-md py-24 text-center">
        <p className="font-serif text-3xl tracking-[0.18em] text-plum">BRAIDY <span className="font-sans text-xs tracking-[0.35em] text-gold">SALON</span></p>
        <h1 className="mt-6 text-3xl text-plum">Website admin</h1>
        {body}
        {msg && <p role="alert" className="err mt-4">{msg}</p>}
        <Link to="/" className="mt-8 inline-block text-sm text-ink/60 underline">Back to website</Link>
      </div>
    </div>
  );

  if (phase === 'loading') return shell(<p className="mt-4 text-ink/70">Loading…</p>);
  if (phase === 'out') return shell(<>
    <p className="mt-3 text-ink/70">Sign in to edit your website, photos and bookings. The first account becomes the admin; invited emails can create an account too.</p>
    <form onSubmit={(e) => { e.preventDefault(); void signIn(); }} className="mt-6 space-y-4 text-left">
      <div><label htmlFor="admin-email" className="label">Email</label><input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></div>
      <div><label htmlFor="admin-password" className="label">Password</label><input id="admin-password" type="password" autoComplete="current-password" minLength={10} required value={password} onChange={(e) => setPassword(e.target.value)} className="input" /></div>
      <button type="submit" className="btn-primary w-full">Sign in</button>
      <button type="button" onClick={() => void createAdmin()} className="btn-ghost w-full">Create admin account</button>
      <p className="text-xs text-ink/60">Passwords must be at least 10 characters. New accounts are allowed only for the first admin or an invited email.</p>
    </form>
  </>);
  if (phase === 'denied') return shell(<><p className="mt-3 text-ink/70">This account is not an admin. Ask an existing admin to invite your email address, then sign in again with that same email.</p><button type="button" onClick={() => void signOut()} className="btn-ghost mt-8">Sign out</button></>);

  const ctx: Ctx = { urls, setUrl: (p, u) => setUrls((x) => ({ ...x, [p]: u })), services: content.services.map((s: Json) => ({ id: s.id, name: s.name })) };

  return (
    <div className="min-h-screen bg-night text-ink">
      <header className="sticky top-0 z-30 border-b border-gold/20 bg-night/95 backdrop-blur">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="font-serif text-xl tracking-[0.15em] text-plum">BRAIDY <span className="font-sans text-[10px] tracking-[0.3em] text-gold">ADMIN</span></p>
          <div className="flex flex-wrap items-center gap-3">
            {msg && <span role="status" className="text-sm text-plum">{msg}</span>}
            <Link to="/" target="_blank" className="text-sm underline">View website</Link>
            <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary !min-h-[40px] !px-5">{saving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" onClick={() => void signOut()} aria-label="Sign out" className="p-2 text-ink/70"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="wrap flex gap-2 overflow-x-auto pb-3">
          {Object.keys(TABS).map((t) => (
            <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={`min-h-[40px] shrink-0 rounded-full border px-4 text-sm ${tab === t ? 'border-plum bg-plum text-night' : 'border-gold/30 text-plum'}`}>{t}</button>
          ))}
        </nav>
      </header>
      <main className="wrap max-w-3xl space-y-10 py-10">
        {tab === 'Photos' ? (
          <section><h1 className="mb-6 text-3xl text-plum">Photos</h1><PhotosPanel content={content} ctx={ctx} update={(path, value) => setContent((current: Json) => setIn(current, path, value))} /></section>
        ) : tab === 'Admins' ? (
          <section><h1 className="mb-6 text-3xl text-plum">Admins</h1><AdminsPanel /></section>
        ) : tab === 'Bookings' ? (
          <section><h1 className="mb-6 text-3xl text-plum">Booking requests</h1><Bookings /></section>
        ) : (
          TABS[tab].map((path) => {
            const p = path.split('.');
            return (
              <section key={path}>
                <h1 className="mb-6 text-3xl text-plum">{human(p[p.length - 1])}</h1>
                <Node label={p[p.length - 1]} value={getIn(content, p)} ctx={ctx} onChange={(v) => setContent(setIn(content, p, v))} />
              </section>
            );
          })
        )}
        <p className="text-sm text-ink/60">Remember to press Save changes. Text in *stars* is shown in gold on the home page title.</p>
      </main>
    </div>
  );
}
