import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Heart, Leaf, Sparkles } from 'lucide-react';
import { Visual } from '../components/Art';
import ServiceCard from '../components/ServiceCard';
import GalleryGrid from '../components/GalleryGrid';
import BookingForm from '../components/BookingForm';
import Accordion from '../components/Accordion';
import { faqs, services, testimonials } from '../data/content';
import { copy } from '../data/copy';
import { site } from '../data/site';
import { usePageMeta } from '../lib/meta';
import { rich } from '../lib/rich';

const icons = [Sparkles, Leaf, Crown, Heart];

export default function Home() {
  const c = copy.home;
  usePageMeta('Home', 'BRAIDY SALON: knotless braids, box braids, cornrows, twists and protective styling. Request your appointment online.');
  return (
    <>
      <section className="hero-glow overflow-hidden bg-night">
        <div className="wrap grid grid-cols-[minmax(0,1.15fr)_minmax(96px,0.85fr)] items-center gap-3 py-8 min-[400px]:gap-4 sm:grid-cols-[1.1fr_0.9fr] sm:gap-10 sm:py-12 lg:gap-16 lg:py-20">
          <div className="rise min-w-0">
            <p className="eyebrow text-[8px] leading-tight tracking-[0.12em] min-[400px]:text-[9px] sm:text-xs sm:tracking-[0.28em]">{site.altTagline}</p>
            <h1 className="mt-2 text-2xl leading-[1.05] text-plum min-[400px]:text-[28px] sm:mt-5 sm:text-6xl lg:text-7xl">{rich(c.heroTitle)}</h1>
            <p className="lead mt-3 line-clamp-5 text-xs sm:mt-5 sm:line-clamp-none sm:text-lg">{c.heroText}</p>
            <div className="mt-4 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
              <Link to="/booking" className="btn-primary !min-h-[40px] !px-2 !text-[9px] !tracking-[0.04em] min-[400px]:!text-[10px] sm:!min-h-[48px] sm:!px-7 sm:!text-sm sm:!tracking-wider">{c.heroPrimary}</Link>
              <Link to="/gallery" className="btn-ghost !min-h-[40px] !px-2 !text-[9px] !tracking-[0.04em] min-[400px]:!text-[10px] sm:!min-h-[48px] sm:!px-7 sm:!text-sm sm:!tracking-wider">{c.heroSecondary}</Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[10px] text-plum/80 sm:mt-8 sm:gap-3 sm:text-sm"><span className="h-px w-5 shrink-0 bg-gold sm:w-10" />{c.heroNote}</p>
          </div>
          <div className="relative w-full max-w-[180px] justify-self-end lg:max-w-none">
            <div className="absolute -bottom-4 -right-4 h-full w-full rounded-t-[999px] border border-gold" aria-hidden="true" />
            <Visual src={site.heroImage} alt="BRAIDY SALON featured hairstyle" pattern="fulani" tone={0} ratio="4/5" className="relative rounded-t-[999px]" eager />
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="border-y border-gold/20 bg-plum-deep py-4">
        <ul className="wrap flex flex-wrap justify-center gap-x-8 gap-y-1 font-serif text-xs uppercase tracking-[0.3em] text-gold/80 sm:text-sm">{services.slice(0, 6).map((s) => <li key={s.id}>{s.name}</li>)}</ul>
      </div>

      <section aria-label="Highlights" className="border-b border-plum/10 bg-beige">
        <ul className="wrap grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {c.highlights.map((h, i) => {
            const Icon = icons[i % icons.length];
            return <li key={h.title}><Icon className="h-6 w-6 text-gold" aria-hidden="true" /><h2 className="mt-3 text-xl text-plum">{h.title}</h2><p className="mt-1 text-sm text-ink/70">{h.text}</p></li>;
          })}
        </ul>
      </section>

      <section className="section">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Visual src={c.aboutImage} alt="About BRAIDY SALON" pattern="twists" tone={1} ratio="4/5" className="max-w-md" />
          <div>
            <p className="eyebrow">{c.aboutEyebrow}</p>
            <h2 className="h2">{c.aboutTitle}</h2>
            <p className="lead">{c.aboutText}</p>
            <Link to="/about" className="btn-ghost mt-8">{c.aboutButton}</Link>
          </div>
        </div>
      </section>

      <section className="section bg-beige">
        <div className="wrap">
          <p className="eyebrow">{c.servicesEyebrow}</p>
          <h2 className="h2">{c.servicesTitle}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-3">{services.slice(0, 6).map((s) => <ServiceCard key={s.id} s={s} />)}</div>
          <Link to="/services" className="btn-primary mt-10">{c.servicesButton} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="eyebrow">{c.galleryEyebrow}</p>
          <h2 className="h2">{c.galleryTitle}</h2>
          {c.galleryText && <p className="lead">{c.galleryText}</p>}
          <div className="mt-10"><GalleryGrid filters={false} limit={6} /></div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link to="/gallery" className="btn-ghost">{c.galleryFind}</Link><Link to="/booking" className="btn-primary">{c.galleryBook}</Link></div>
        </div>
      </section>

      <section className="section bg-beige text-cream">
        <div className="wrap">
          <p className="eyebrow">{c.whyEyebrow}</p>
          <h2 className="h2">{c.whyTitle}</h2>
          <dl className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">{c.why.map((w) => <div key={w.title} className="border-t border-gold/60 pt-5"><dt className="font-serif text-xl">{w.title}</dt><dd className="mt-2 text-sm text-cream/80">{w.text}</dd></div>)}</dl>
        </div>
      </section>

      <section className="section bg-plum-deep" aria-labelledby="book-h">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="text-cream">
            <p className="eyebrow">{c.bookEyebrow}</p>
            <h2 id="book-h" className="h2">{c.bookTitle}</h2>
            <p className="mt-5 text-cream/80">{c.bookText}</p>
          </div>
          <BookingForm />
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="section">
          <div className="wrap">
            <h2 className="h2">Kind words</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">{testimonials.map((t) => <figure key={t.name} className="border border-plum/15 bg-surface p-6"><blockquote className="font-serif text-lg text-plum">{t.text}</blockquote><figcaption className="mt-4 text-sm">{t.name}</figcaption></figure>)}</div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap max-w-3xl">
          <p className="eyebrow">{c.faqEyebrow}</p>
          <h2 className="h2 mb-8">{c.faqTitle}</h2>
          <Accordion items={faqs} />
        </div>
      </section>

      <section className="cta-glow py-20 text-center text-cream sm:py-28">
        <div className="wrap">
          <h2 className="mx-auto max-w-2xl text-4xl sm:text-5xl">{c.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-lg text-cream/80">{c.ctaText}</p>
          <Link to="/booking" className="btn-gold mt-8">{c.ctaButton}</Link>
        </div>
      </section>
    </>
  );
}
