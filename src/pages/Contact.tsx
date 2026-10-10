import { useState, type FormEvent, type ReactNode } from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { TBC } from '../components/Layout';
import { copy } from '../data/copy';
import { site } from '../data/site';
import { deliver } from '../lib/send';
import { usePageMeta } from '../lib/meta';

export default function Contact() {
  usePageMeta('Contact', 'Contact BRAIDY SALON: location, opening hours and enquiries.');
  const c = copy.contact;
  const { whatsapp, phone, email, address, mapEmbedUrl } = site.contact;
  const [f, setF] = useState({ name: '', reply: '', msg: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 2 || f.reply.trim().length < 5 || f.msg.trim().length < 5) { setErr('Please fill in your name, how we can reach you, and a message.'); return; }
    setErr('');
    try {
      const ch = deliver(`Enquiry from ${f.name}\nReply to: ${f.reply}\n\n${f.msg}`, `Enquiry from ${f.name}`);
      setDone(ch === 'none' ? 'No salon contact is configured yet, so nothing was sent.' : 'Your message app opened. Press send there to complete your enquiry.');
    } catch { setErr('Could not open WhatsApp. Please allow pop-ups and try again.'); }
  };

  const row = (Icon: typeof Phone, label: string, content: ReactNode) => <li className="flex gap-3"><Icon className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" /><div><p className="text-xs font-semibold uppercase tracking-widest text-plum/60">{label}</p><div className="text-ink">{content}</div></div></li>;

  return (
    <>
      <PageHeader eyebrow="Contact" title={c.title}>{c.intro}</PageHeader>
      <section className="section">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div>
            <ul className="space-y-6">
              {row(MapPin, 'Address', address || TBC)}
              {row(Phone, 'Phone', phone ? <a href={`tel:${phone}`} className="underline">{phone}</a> : TBC)}
              {row(MessageCircle, 'WhatsApp', whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline">Chat on WhatsApp</a> : TBC)}
              {row(Mail, 'Email', email ? <a href={`mailto:${email}`} className="underline">{email}</a> : TBC)}
              {row(Clock, 'Opening hours', <ul>{site.hours.map((h) => <li key={h.days}>{h.days}: {h.time || TBC}</li>)}</ul>)}
            </ul>
            <div className="mt-8 aspect-video overflow-hidden bg-beige">
              {mapEmbedUrl ? <iframe title="Salon location map" src={mapEmbedUrl} loading="lazy" className="h-full w-full border-0" /> : <p className="flex h-full items-center justify-center p-6 text-center text-sm text-ink/60">A map will appear here once the salon address is added.</p>}
            </div>
          </div>
          <form onSubmit={submit} noValidate className="space-y-5 bg-beige p-6 sm:p-8" aria-label="Enquiry form">
            <h2 className="text-2xl text-plum">{c.formTitle}</h2>
            <div><label htmlFor="c-name" className="label">Your name *</label><input id="c-name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
            <div><label htmlFor="c-reply" className="label">Phone or email *</label><input id="c-reply" className="input" value={f.reply} onChange={(e) => setF({ ...f, reply: e.target.value })} /></div>
            <div><label htmlFor="c-msg" className="label">Message *</label><textarea id="c-msg" rows={4} className="input py-3" value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} /></div>
            {err && <p role="alert" className="err">{err}</p>}
            {done && <p role="status" className="text-sm text-plum">{done}</p>}
            <button type="submit" className="btn-primary">Send Enquiry</button>
          </form>
        </div>
      </section>
    </>
  );
}
