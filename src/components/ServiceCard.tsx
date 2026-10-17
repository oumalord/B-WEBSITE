import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Visual } from './Art';
import { SampleBadge } from './ui';
import { site } from '../data/site';
import type { Service } from '../data/content';

export default function ServiceCard({ s }: { s: Service }) {
  const photos = (Array.isArray(s.images) ? s.images : s.image ? [s.image] : []).filter(Boolean).slice(0, 3);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const activePhoto = photos[Math.min(selectedPhoto, Math.max(photos.length - 1, 0))];

  return (
    <article className="group flex flex-col border border-plum/15 bg-surface transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_0_40px_rgba(201,162,92,0.15)]">
      <div className="overflow-hidden">
        <Visual src={activePhoto} alt={`${s.name}${photos.length > 1 ? ` photo ${Math.min(selectedPhoto, photos.length - 1) + 1}` : ' illustration'}`} pattern={s.pattern} tone={s.tone} ratio="4/3" className="transition duration-500 group-hover:scale-105" />
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-3 gap-1.5 px-2.5 pt-2.5 sm:gap-2 sm:px-3 sm:pt-3">
          {photos.map((photo, index) => (
            <button key={`${photo}-${index}`} type="button" aria-label={`Show ${s.name} photo ${index + 1}`} aria-pressed={Math.min(selectedPhoto, photos.length - 1) === index} onClick={() => setSelectedPhoto(index)} className={`overflow-hidden border ${Math.min(selectedPhoto, photos.length - 1) === index ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <Visual src={photo} alt="" pattern={s.pattern} tone={s.tone} ratio="1/1" />
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-1 flex-col p-2.5 sm:p-6">
        <h3 className="text-base leading-tight text-plum sm:text-2xl">{s.name}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-ink/75 sm:text-sm">{s.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink/80 sm:mt-4 sm:gap-x-4 sm:text-sm">
          {s.from !== undefined && <span className="font-semibold">From {site.currency}{s.from}</span>}
          {s.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" />{s.duration}</span>}
          {s.from !== undefined && site.pricesAreSample && <SampleBadge />}
        </div>
        <Link to={`/booking?service=${s.id}`} className="btn-ghost mt-4 !min-h-[40px] !px-2 !text-[9px] !tracking-normal sm:mt-5 sm:!min-h-[48px] sm:!px-7 sm:!text-sm sm:!tracking-wider">Book This Style</Link>
      </div>
    </article>
  );
}
