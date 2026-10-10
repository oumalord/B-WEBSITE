import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Visual } from './Art';
import type { GalleryItem } from '../data/content';

interface Props { items: GalleryItem[]; index: number; onClose: () => void; onIndex: (i: number) => void }

export default function Lightbox({ items, index, onClose, onIndex }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const item = items[index];
  const prev = () => onIndex((index - 1 + items.length) % items.length);
  const next = () => onIndex((index + 1) % items.length);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; opener?.focus(); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, a[href]');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`${item.title}, enlarged view`} className="fixed inset-0 z-[60] flex items-center justify-center bg-plum-deep/95 p-4" onClick={onClose}>
      <div className="relative flex max-h-full w-full max-w-md flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close enlarged view" className="absolute -top-1 right-0 z-10 flex h-12 w-12 -translate-y-full items-center justify-center rounded-full text-cream hover:bg-white/10"><X className="h-6 w-6" /></button>
        <Visual src={item.image} alt={item.title} pattern={item.pattern} tone={item.tone} ratio="4/5" className="max-h-[68vh] w-full" eager />
        <div className="flex items-center justify-between gap-3 text-cream">
          <button type="button" onClick={prev} aria-label="Previous style" className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/40 hover:bg-white/10"><ChevronLeft /></button>
          <div className="text-center">
            <p className="font-serif text-lg">{item.title}</p>
            <Link to={`/booking?service=${item.service}`} onClick={onClose} className="text-sm text-gold underline underline-offset-4">Book This Look</Link>
          </div>
          <button type="button" onClick={next} aria-label="Next style" className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/40 hover:bg-white/10"><ChevronRight /></button>
        </div>
      </div>
    </div>
  );
}
