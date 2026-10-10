import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="bg-beige pb-10 pt-12 sm:pb-20 sm:pt-24">
      <div className="wrap rise">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-3xl leading-tight text-plum min-[400px]:text-4xl sm:text-6xl">{title}</h1>
        {children && <p className="lead mt-3 text-sm sm:mt-5 sm:text-lg">{children}</p>}
      </div>
    </header>
  );
}

export function SampleBadge() {
  return <span className="rounded-full border border-gold/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-plum/70">Sample</span>;
}
