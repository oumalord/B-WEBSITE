import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { api } from '../lib/localApi';
import { services } from '../data/content';
import { site } from '../data/site';
import { deliver } from '../lib/send';

type Vals = { name: string; phone: string; email: string; service: string; date: string; time: string; notes: string };
type Errs = Partial<Record<keyof Vals, string>>;
type Status = 'idle' | 'submitting' | 'saved' | 'error';

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function validate(v: Vals): Errs {
  const e: Errs = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your full name.';
  if (v.phone.replace(/\D/g, '').length < 7 || !/^[+()\d\s-]+$/.test(v.phone)) e.phone = 'Enter a valid phone number (digits, spaces, + or -).';
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Enter a valid email address or leave this blank.';
  if (!v.service) e.service = 'Please choose a service.';
  if (!v.date) e.date = 'Please choose a preferred date.';
  else if (v.date < today()) e.date = 'Please choose today or a future date.';
  if (!v.time) e.time = 'Please choose a preferred time.';
  return e;
}

const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? '';

const buildText = (v: Vals) =>
  `Hello ${site.name}, I would like to request an appointment.\nName: ${v.name}\nPhone: ${v.phone}${v.email ? `\nEmail: ${v.email}` : ''}\nService: ${serviceName(v.service)}\nDate: ${v.date}\nTime: ${v.time}${v.notes ? `\nNotes: ${v.notes}` : ''}`;

export default function BookingForm() {
  const [params] = useSearchParams();
  const pre = params.get('service') ?? '';
  const [v, setV] = useState<Vals>({ name: '', phone: '', email: '', service: services.some((s) => s.id === pre) ? pre : '', date: '', time: '', notes: '' });
  const [errs, setErrs] = useState<Errs>({});
  const [status, setStatus] = useState<Status>('idle');
  const [waNote, setWaNote] = useState('');

  const bind = (k: keyof Vals) => ({
    id: `bk-${k}`,
    value: v[k],
    'aria-invalid': errs[k] ? (true as const) : undefined,
    'aria-describedby': errs[k] ? `bk-${k}-err` : undefined,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value }),
  });
  const err = (k: keyof Vals) => errs[k] && <p id={`bk-${k}-err`} className="err">{errs[k]}</p>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(v);
    setErrs(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`bk-${first}`)?.focus(); return; }
    const form = e.currentTarget as HTMLFormElement;
    const trap = (form.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';
    const whatsappWindow = !trap && site.contact.whatsapp ? window.open('about:blank', '_blank') : undefined;
    setStatus('submitting');
    try {
      await api.post('/api/bookings', {
        name: v.name.trim(), phone: v.phone.trim(), email: v.email.trim(), service: v.service,
        serviceName: serviceName(v.service), date: v.date, time: v.time, notes: v.notes.trim(), website: trap,
      });
      setStatus('saved');
      if (trap) return;
      if (site.contact.whatsapp) {
        if (whatsappWindow) whatsapp(whatsappWindow);
        else setWaNote('Your request was saved, but the browser blocked WhatsApp. Use the button below to open your message.');
      } else if (site.contact.email) {
        setWaNote('Your request was saved. Use the button below to prepare an email for the salon.');
      } else {
        setWaNote('Your request was saved, but the salon has no WhatsApp number configured yet.');
      }
    } catch {
      whatsappWindow?.close();
      setStatus('error');
    }
  };

  const whatsapp = (target?: Window | null) => {
    try {
      const channel = deliver(buildText(v), `Appointment request: ${v.name}`, target);
      setWaNote(channel === 'whatsapp' ? 'WhatsApp opened with your booking draft. Tap Send in WhatsApp to deliver it.' : channel === 'email' ? 'Email draft opened. Send it to complete your request.' : 'No salon contact is configured yet.');
    } catch {
      setWaNote('Could not open WhatsApp. Please allow pop-ups and try again.');
    }
  };

  if (status === 'saved') {
    return (
      <div role="status" className="bg-surface p-6 sm:p-8">
        <Check className="h-8 w-8 text-plum" aria-hidden="true" />
        <h3 className="mt-3 text-2xl text-plum">Request received</h3>
        <p className="mt-2 text-ink/80">Thank you, {v.name.split(' ')[0]}. Your request for {serviceName(v.service)} on {v.date} at {v.time} is saved, but it is not a confirmed appointment. The salon will contact you on {v.phone} to confirm.</p>
        {(site.contact.whatsapp || site.contact.email) && <button type="button" onClick={() => whatsapp()} className="btn-ghost mt-5">{site.contact.whatsapp ? 'Open WhatsApp message' : 'Open email draft'}</button>}
        {waNote && <p className="mt-3 text-sm text-ink/70">{waNote}</p>}
        <button type="button" onClick={() => { setStatus('idle'); setWaNote(''); setV({ ...v, notes: '', date: '', time: '' }); }} className="btn-primary mt-4 block">Make another request</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 bg-surface p-4 min-[380px]:grid-cols-2 min-[380px]:gap-4 min-[380px]:p-6 sm:gap-5 sm:p-8" aria-label="Appointment request">
      <div><label htmlFor="bk-name" className="label">Full name *</label><input className="input" autoComplete="name" {...bind('name')} />{err('name')}</div>
      <div><label htmlFor="bk-phone" className="label">Phone number *</label><input className="input" type="tel" autoComplete="tel" {...bind('phone')} />{err('phone')}</div>
      <div><label htmlFor="bk-email" className="label">Email (optional)</label><input className="input" type="email" autoComplete="email" {...bind('email')} />{err('email')}</div>
      <div>
        <label htmlFor="bk-service" className="label">Preferred service *</label>
        <select className="input" {...bind('service')}><option value="">Select a service</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        {err('service')}
      </div>
      <div><label htmlFor="bk-date" className="label">Preferred date *</label><input className="input" type="date" min={today()} {...bind('date')} />{err('date')}</div>
      <div>
        <label htmlFor="bk-time" className="label">Preferred time *</label>
        <select className="input" {...bind('time')}><option value="">Select a time</option>{site.timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        {err('time')}
      </div>
      <div className="col-span-full"><label htmlFor="bk-notes" className="label">Additional notes</label><textarea rows={3} className="input py-3" placeholder="Length, size, colour, inspiration…" {...bind('notes')} /></div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" defaultValue="" />
      <div className="col-span-full">
        {status === 'error' && <p role="alert" className="err mb-3">We could not send your request. Please try again, or contact the salon directly by phone.</p>}
        <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full sm:w-auto">{status === 'submitting' ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Sending…</> : 'Submit Booking Request'}</button>
        <p className="mt-3 text-xs text-ink/60">This sends a request only. Your appointment is confirmed once the salon replies.</p>
      </div>
    </form>
  );
}
