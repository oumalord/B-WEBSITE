import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="bg-beige pb-14 pt-16 sm:pb-20 sm:pt-24">
      <div className="wrap rise">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl text-plum sm:text-6xl">{title}</h1>
        {children && <p className="lead">{children}</p>}
      </div>
    </header>
  );
}

export function SampleBadge() {
  return <span className="rounded-full border border-gold/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-plum/70">Sample</span>;
}
