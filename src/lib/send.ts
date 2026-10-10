import { site } from '../data/site';

export type Channel = 'whatsapp' | 'email' | 'none';

// Hands the request to WhatsApp or the email client. Nothing is stored or sent by this function itself.
export function deliver(text: string, subject: string, whatsappWindow?: Window | null): Channel {
  const { whatsapp, email } = site.contact;
  if (whatsapp) {
    const url = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    const w = whatsappWindow === undefined ? window.open(url, '_blank') : whatsappWindow;
    if (!w) throw new Error('blocked');
    if (whatsappWindow !== undefined) w.location.href = url;
    w.opener = null;
    return 'whatsapp';
  }
  whatsappWindow?.close();
  if (email) {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return 'email';
  }
  return 'none';
}
