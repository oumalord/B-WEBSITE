import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowUp,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { site } from '../data/site';

const nav = [
  ['/', 'Home'],
  ['/about', 'About Us'],
  ['/services', 'Services'],
  ['/gallery', 'Gallery'],
  ['/pricing', 'Pricing'],
  ['/contact', 'Contact'],
];

export const TBC = <span className="italic text-ink/50">To be confirmed</span>;

function Wordmark({ light }: { light?: boolean }) {
  if (site.logoImage) {
    return <img src={site.logoImage} alt={site.name} className="h-10 w-auto sm:h-12" />;
  }
  return (
    <span
      className={`font-serif text-2xl tracking-[0.18em] ${light ? 'text-cream' : 'text-plum'}`}
    >
      BRAIDY
      <span className="ml-2 align-middle font-sans text-[10px] font-semibold tracking-[0.35em] text-gold">
        SALON
      </span>
    </span>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bar, setBar] = useState(site.announcement.enabled);

  useEffect(() => {
    setMenu(false);
    if (pathname !== '/pricing') window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 600);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const { whatsapp, phone, email, address } = site.contact;
  const socials = [
    ['Instagram', site.social.instagram, Instagram],
    ['Facebook', site.social.facebook, Facebook],
  ] as const;

  return (
    <>
      <a
        href="#main"
        onClick={e => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:bg-night focus:p-3"
      >
        Skip to content
      </a>
      {bar && (
        <div className="relative bg-plum-deep px-10 py-2 text-center text-xs text-cream sm:text-sm">
          {site.announcement.text}{' '}
          <Link
            to={site.announcement.linkTo}
            className="font-semibold text-gold underline underline-offset-4"
          >
            {site.announcement.linkLabel}
          </Link>
          <button
            type="button"
            onClick={() => setBar(false)}
            aria-label="Dismiss announcement"
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <header className="sticky top-0 z-50 border-b border-plum/10 bg-night/95 backdrop-blur">
        <div className="wrap flex h-[72px] items-center justify-between">
          <Link to="/" aria-label="BRAIDY SALON home">
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {nav.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `text-sm font-medium transition hover:text-plum ${isActive ? 'text-plum underline decoration-gold decoration-2 underline-offset-8' : 'text-ink/75'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link to="/booking" className="btn-primary !min-h-[44px] !px-6">
              Book Appointment
            </Link>
          </nav>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center lg:hidden"
            aria-expanded={menu}
            aria-controls="mobile-nav"
            aria-label={menu ? 'Close menu' : 'Open menu'}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className={`grid overflow-hidden bg-night transition-all duration-300 lg:hidden ${menu ? 'max-h-[28rem] border-t border-plum/10' : 'max-h-0'}`}
          {...(menu ? {} : ({ inert: true } as object))}
        >
          <div className="wrap flex flex-col py-3">
            {nav.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `flex min-h-[48px] items-center border-b border-plum/10 font-serif text-xl ${isActive ? 'text-plum' : 'text-ink/80'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link to="/booking" className="btn-primary my-4">
              Book Appointment
            </Link>
          </div>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>

      <footer className="bg-plum-deep text-cream/85">
        <div className="wrap grid gap-10 py-16 md:grid-cols-4">
          <div className="md:col-span-1">
            <Wordmark light />
            <p className="mt-4 text-sm leading-relaxed">
              {site.tagline} Braiding and styling crafted with creativity, care
              and precision.
            </p>
            <div className="mt-4 flex gap-2">
              {socials
                .filter(([, url]) => url)
                .map(([name, url, Icon]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 hover:bg-white/10"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              {socials.every(([, url]) => !url) && (
                <p className="text-xs italic text-cream/60">
                  Social links coming soon
                </p>
              )}
            </div>
          </div>
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
              Explore
            </h2>
            <ul className="mt-4 space-y-1 text-sm">
              {[...nav, ['/booking', 'Book Appointment']].map(([to, l]) => (
                <li key={to}>
                  <Link to={to} className="inline-block py-1.5 hover:text-gold">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {address || 'Address to be confirmed'}
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {phone ? (
                  <a href={`tel:${phone}`}>{phone}</a>
                ) : (
                  'Phone to be confirmed'
                )}
              </li>
              <li className="flex gap-2">
                <MessageCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {whatsapp ? (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp us
                  </a>
                ) : (
                  'WhatsApp to be confirmed'
                )}
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {email ? (
                  <a href={`mailto:${email}`}>{email}</a>
                ) : (
                  'Email to be confirmed'
                )}
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
              Opening hours
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {site.hours.map(h => (
                <li key={h.days} className="flex gap-2">
                  <Clock
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    {h.days}: {h.time || 'to be confirmed'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/15">
          <div className="wrap flex flex-col gap-2 py-6 text-xs sm:flex-row sm:justify-between">
            <p>
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <p className="flex gap-5">
              <Link to="/privacy" className="py-1 hover:text-gold">
                Privacy Policy
              </Link>
              <Link to="/terms" className="py-1 hover:text-gold">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {scrolled && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-plum text-night shadow-lg hover:bg-gold"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
