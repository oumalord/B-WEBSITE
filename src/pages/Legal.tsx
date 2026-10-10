import { PageHeader } from '../components/ui';
import { copy } from '../data/copy';
import { usePageMeta } from '../lib/meta';

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const c = copy[kind];
  usePageMeta(c.title, `${c.title} for BRAIDY SALON.`);
  return (
    <>
      <PageHeader eyebrow="Legal" title={c.title}>{c.intro}</PageHeader>
      <section className="section"><div className="wrap max-w-3xl space-y-8">{c.sections.map((s) => <div key={s.heading}><h2 className="text-2xl text-plum">{s.heading}</h2><p className="mt-2 text-ink/80">{s.text}</p></div>)}</div></section>
    </>
  );
}
