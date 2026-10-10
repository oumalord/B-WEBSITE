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
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Visual src={c.image} alt="BRAIDY SALON story" pattern="cornrows" tone={0} ratio="4/5" className="max-w-md" />
          <div className="space-y-5 text-ink/80">
            <p>{c.body1}</p>
            <p>{c.body2}</p>
            {c.story.split('\n\n').filter(Boolean).map((para) => <p key={para}>{para}</p>)}
            <Link to="/booking" className="btn-primary">{c.button}</Link>
          </div>
        </div>
      </section>
      <section className="section bg-beige">
        <ul className="wrap grid gap-8 md:grid-cols-3">{c.values.map((v) => <li key={v.title} className="border-t border-gold pt-5"><h2 className="text-2xl text-plum">{v.title}</h2><p className="mt-2 text-ink/75">{v.text}</p></li>)}</ul>
      </section>
    </>
  );
}
