import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import { Visual } from '../components/Art';
import { copy } from '../data/copy';
import { usePageMeta } from '../lib/meta';

export default function About() {
  const c = copy.about;
  usePageMeta('About Us', 'The story and values behind BRAIDY SALON.');
  return (
    <>
      <PageHeader eyebrow="About Us" title={c.title}>{c.intro}</PageHeader>
      <section className="section">
        <div className="wrap grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-4 py-10 sm:gap-12 sm:py-28 lg:grid-cols-2">
          <Visual src={c.image} alt="BRAIDY SALON story" pattern="cornrows" tone={0} ratio="4/5" className="max-w-md" />
          <div className="min-w-0 space-y-3 text-xs leading-relaxed text-ink/80 sm:space-y-5 sm:text-base">
            <p>{c.body1}</p>
            <p>{c.body2}</p>
            {c.story.split('\n\n').filter(Boolean).map((para) => <p key={para}>{para}</p>)}
            <Link to="/booking" className="btn-primary">{c.button}</Link>
          </div>
        </div>
      </section>
      <section className="section bg-beige">
        <ul className="wrap grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-3">{c.values.map((v) => <li key={v.title} className="border-t border-gold pt-3 sm:pt-5"><h2 className="text-lg text-plum sm:text-2xl">{v.title}</h2><p className="mt-2 text-xs text-ink/75 sm:text-base">{v.text}</p></li>)}</ul>
      </section>
    </>
  );
}
