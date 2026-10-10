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
const marqueeServices = services.filter((service) => ['knotless', 'box', 'cornrows'].includes(service.id));

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
            <div className="mt-4 flex sm:mt-8">
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

      <div className="service-marquee border-y border-gold/20 bg-plum-deep py-3" aria-label="Featured styles">
        <div className="service-marquee-track">
          {[false, true].map((duplicate) => (
            <ul key={String(duplicate)} aria-hidden={duplicate || undefined} className="service-marquee-group">
              {marqueeServices.map((service) => <li key={service.id}>{service.name}</li>)}
            </ul>
          ))}
        </div>
      </div>

      <section aria-label="Highlights" className="border-b border-plum/10 bg-beige">
        <ul className="wrap grid grid-cols-2 gap-4 py-8 sm:gap-8 sm:py-12 lg:grid-cols-4">
          {c.highlights.map((h, i) => {
            const Icon = icons[i % icons.length];
            return <li key={h.title}><Icon className="h-5 w-5 text-gold sm:h-6 sm:w-6" aria-hidden="true" /><h2 className="mt-2 text-base text-plum sm:mt-3 sm:text-xl">{h.title}</h2><p className="mt-1 text-xs text-ink/70 sm:text-sm">{h.text}</p></li>;
          })}
        </ul>
      </section>

      <section className="section">
        <div className="wrap grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-4 py-10 sm:gap-12 sm:py-28 lg:grid-cols-2">
          <Visual src={c.aboutImage} alt="About BRAIDY SALON" pattern="twists" tone={1} ratio="4/5" className="max-w-md" />
          <div className="min-w-0">
            <p className="eyebrow">{c.aboutEyebrow}</p>
            <h2 className="h2 text-xl sm:text-3xl lg:text-5xl">{c.aboutTitle}</h2>
            <p className="lead mt-3 text-xs sm:mt-5 sm:text-lg">{c.aboutText}</p>
            <Link to="/about" className="btn-ghost mt-4 !min-h-[40px] !px-3 !text-[10px] sm:mt-8 sm:!min-h-[48px] sm:!px-7 sm:!text-sm">{c.aboutButton}</Link>
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
          <dl className="mt-8 grid grid-cols-2 gap-5 sm:mt-12 sm:gap-10 lg:grid-cols-4">{c.why.map((w) => <div key={w.title} className="border-t border-gold/60 pt-3 sm:pt-5"><dt className="font-serif text-base sm:text-xl">{w.title}</dt><dd className="mt-2 text-xs text-cream/80 sm:text-sm">{w.text}</dd></div>)}</dl>
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
            <div className="mt-6 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-3 md:gap-6">{testimonials.map((t) => <figure key={t.name} className="border border-plum/15 bg-surface p-3 sm:p-6"><blockquote className="font-serif text-sm text-plum sm:text-lg">{t.text}</blockquote><figcaption className="mt-3 text-xs sm:mt-4 sm:text-sm">{t.name}</figcaption></figure>)}</div>
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
