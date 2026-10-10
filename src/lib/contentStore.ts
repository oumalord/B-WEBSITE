import { api } from './localApi';
import { site } from '../data/site';
import { services, gallery, faqs, testimonials } from '../data/content';
import { copy } from '../data/copy';

// Snapshot of the built-in content, taken before any saved content is applied.
export const DEFAULTS = JSON.parse(JSON.stringify({ site, services, gallery, faqs, testimonials, copy }));

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

// Objects merge key by key; arrays and text from `over` replace the defaults.
export function merge(base: any, over: any): any {
  if (over === undefined || over === null) return base;
  if (isObj(base) && isObj(over)) {
    const out: any = { ...base };
    for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k];
    return out;
  }
  return over;
}

export function applyContent(saved: any) {
  const m = merge(DEFAULTS, saved);
  Object.assign(site, m.site);
  services.splice(0, services.length, ...m.services);
  gallery.splice(0, gallery.length, ...m.gallery);
  faqs.splice(0, faqs.length, ...m.faqs);
  testimonials.splice(0, testimonials.length, ...m.testimonials);
  Object.assign(copy, m.copy);
}

export async function loadPublicContent() {
  try {
    const { data } = await api.get('/api/content');
    if (data && data.content) applyContent(data.content);
  } catch {
    // Falls back to the built-in content.
  }
}
