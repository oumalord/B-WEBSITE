import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-plum/15 border-y border-plum/15">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <h3>
              <button type="button" id={`faq-b-${i}`} aria-expanded={isOpen} aria-controls={`faq-p-${i}`} onClick={() => setOpen(isOpen ? null : i)} className="flex min-h-[56px] w-full items-center justify-between gap-4 py-4 text-left font-sans text-base font-medium text-plum">
                {it.q}
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`} hidden={!isOpen} className="pb-5 pr-8 text-ink/75">{it.a}</div>
          </div>
        );
      })}
    </div>
  );
}
