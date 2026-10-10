import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, SampleBadge } from '../components/ui';
import ServiceCard from '../components/ServiceCard';
import { services } from '../data/content';
import { copy } from '../data/copy';
import { site } from '../data/site';
import { usePageMeta } from '../lib/meta';

export default function Services({ pricing }: { pricing?: boolean }) {
  const c = copy.services;
  usePageMeta(pricing ? 'Pricing' : 'Services', 'Braiding, twist and natural hair services with starting prices and estimated durations.');
  useEffect(() => {
    if (pricing) document.getElementById('pricing')?.scrollIntoView();
  }, [pricing]);
  return (
    <>
      <PageHeader eyebrow="Services" title={c.title}>{c.intro}</PageHeader>
      <section className="section pb-12"><div className="wrap grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div></section>
      <section id="pricing" className="section scroll-mt-20 bg-beige">
        <div className="wrap">
          <p className="eyebrow">{c.pricingEyebrow}</p>
          <h2 className="h2">{c.pricingTitle}</h2>
          {site.pricesAreSample && <p className="mt-4 max-w-2xl border-l-2 border-gold pl-4 text-sm text-ink/70">{c.sampleNote}</p>}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[480px] bg-surface text-left text-sm">
              <caption className="sr-only">Service starting prices</caption>
              <thead className="bg-plum text-night"><tr><th scope="col" className="p-4 font-medium">Service</th><th scope="col" className="p-4 font-medium">Starting price</th><th scope="col" className="p-4 font-medium">Duration</th><th scope="col" className="p-4"><span className="sr-only">Book</span></th></tr></thead>
              <tbody className="divide-y divide-plum/10">{services.map((s) => <tr key={s.id}><th scope="row" className="p-4 font-medium text-plum">{s.name}</th><td className="p-4">{site.currency}{s.from} {site.pricesAreSample && <SampleBadge />}</td><td className="p-4">{s.duration}</td><td className="p-4 text-right"><Link to={`/booking?service=${s.id}`} className="font-semibold text-plum underline underline-offset-4">Book</Link></td></tr>)}</tbody>
            </table>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-ink/70">{c.pricingNote}</p>
        </div>
      </section>
    </>
  );
}
