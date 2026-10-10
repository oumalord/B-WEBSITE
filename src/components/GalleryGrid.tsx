import { useState } from 'react';
import { Visual } from './Art';
import Lightbox from './Lightbox';
import { gallery } from '../data/content';

export default function GalleryGrid({
  filters = true,
  limit,
}: {
  filters?: boolean;
  limit?: number;
}) {
  const [cat, setCat] = useState<string>('All Styles');
  const [open, setOpen] = useState<number | null>(null);
  const all =
    cat === 'All Styles' ? gallery : gallery.filter(g => g.category === cat);
  const items = limit ? all.slice(0, limit) : all;

  return (
    <div>
      {filters && (
        <div
          role="group"
          aria-label="Filter hairstyles"
          className="mb-8 flex flex-wrap gap-2"
        >
          {['All Styles', ...Array.from(new Set(gallery.map((g) => g.category)))].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={`min-h-[44px] rounded-full border px-5 text-sm font-medium transition ${cat === c ? 'border-plum bg-plum text-night' : 'border-plum/30 text-plum hover:border-plum'}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <p className="sr-only" role="status">
        {items.length} styles shown
      </p>
      {items.length === 0 ? (
        <p className="py-16 text-center text-ink/70">
          No styles in this category yet. Check back soon.
        </p>
      ) : (
        <ul className="columns-2 gap-3 sm:gap-5 lg:columns-3">
          {items.map((g, i) => (
            <li key={g.id} className="mb-3 break-inside-avoid sm:mb-5">
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`View ${g.title} larger`}
                className="group relative block w-full overflow-hidden text-left"
              >
                <Visual
                  src={g.image}
                  alt={g.title}
                  pattern={g.pattern}
                  tone={g.tone}
                  ratio={g.ratio}
                  className="transition duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-deep/85 to-transparent p-4 pt-10 text-cream opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                  <span className="block font-serif text-lg">{g.title}</span>
                  <span className="text-xs uppercase tracking-widest text-gold">
                    {g.category}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open !== null && (
        <Lightbox
          items={items}
          index={open}
          onClose={() => setOpen(null)}
          onIndex={setOpen}
        />
      )}
    </div>
  );
}
