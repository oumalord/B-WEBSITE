import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Visual } from './Art';
import { SampleBadge } from './ui';
import { site } from '../data/site';
import type { Service } from '../data/content';

export default function ServiceCard({ s }: { s: Service }) {
  return (
    <article className="group flex flex-col border border-plum/15 bg-surface transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_0_40px_rgba(201,162,92,0.15)]">
      <div className="overflow-hidden">
        <Visual src={s.image} alt={`${s.name} illustration`} pattern={s.pattern} tone={s.tone} ratio="4/3" className="transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-6">
        <h3 className="text-base leading-tight text-plum sm:text-2xl">{s.name}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-ink/75 sm:text-sm">{s.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink/80 sm:mt-4 sm:gap-x-4 sm:text-sm">
          <span className="font-semibold">From {site.currency}{s.from}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" />{s.duration}</span>
          {site.pricesAreSample && <SampleBadge />}
        </div>
        <Link to={`/booking?service=${s.id}`} className="btn-ghost mt-4 !min-h-[40px] !px-2 !text-[9px] !tracking-normal sm:mt-5 sm:!min-h-[48px] sm:!px-7 sm:!text-sm sm:!tracking-wider">Book This Style</Link>
      </div>
    </article>
  );
}
