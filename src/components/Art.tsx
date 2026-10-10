import type { ReactElement } from 'react';

export type Pattern = 'plaits' | 'box' | 'cornrows' | 'twists' | 'locs' | 'fulani' | 'natural';

// [background 1, background 2, strand, accent]
const tones: string[][] = [
  ['#0E0B08', '#2A2015', '#E2C37E', '#B8935A'],
  ['#1B1510', '#3A2D1C', '#C9A25C', '#F2E3BF'],
  ['#120F0D', '#2C2623', '#D8B98A', '#8A6A33'],
  ['#241A0F', '#4A361C', '#F2E3BF', '#C9A25C'],
];

const zig = (x: number, y0: number, y1: number, a: number, s = 20) => {
  let d = `M${x},${y0}`;
  let k = 0;
  for (let y = y0 + s; y <= y1; y += s) { d += ` L${x + (k % 2 ? -a : a)},${y}`; k++; }
  return d;
};

const wave = (x: number, y0: number, y1: number, a: number, s = 26) => {
  let d = `M${x},${y0}`;
  let k = 0;
  for (let y = y0 + s; y <= y1; y += s) { d += ` Q${x + (k % 2 ? -a : a)},${y - s / 2} ${x},${y}`; k++; }
  return d;
};

function plaits(n: number, gap: number, w: number, amp: number, s: string, a: string, bg: string): ReactElement[] {
  const start = 200 - ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => {
    const d = zig(start + i * gap, 40, 470, amp);
    return (
      <g key={i} fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={d} stroke={s} strokeWidth={w} />
        <path d={d} stroke={bg} strokeWidth={2} strokeDasharray="2 9" opacity=".55" />
        <circle cx={start + i * gap} cy={474} r={w / 3} fill={a} stroke="none" />
      </g>
    );
  });
}

function rows(n: number, gap: number, s: string, a: string, cx = 200): ReactElement[] {
  const start = cx - ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => {
    const x0 = start + i * gap;
    const d = `M${x0},50 Q${x0},260 ${cx + (x0 - cx) * 0.3},460`;
    return (
      <g key={i} fill="none" strokeLinecap="round">
        <path d={d} stroke={s} strokeWidth={10} />
        <path d={d} stroke={a} strokeWidth={2} strokeDasharray="1 8" opacity=".7" />
      </g>
    );
  });
}

function body(p: Pattern, s: string, a: string, bg: string): ReactElement[] {
  switch (p) {
    case 'plaits': return plaits(9, 36, 13, 7, s, a, bg);
    case 'box': return plaits(6, 56, 22, 10, s, a, bg);
    case 'cornrows': return rows(11, 28, s, a);
    case 'fulani':
      return [
        ...rows(5, 26, s, a),
        ...plaits(2, 34, 12, 6, s, a, bg).map((e, i) => <g key={`l${i}`} transform="translate(-118 0)">{e}</g>),
        ...plaits(2, 34, 12, 6, s, a, bg).map((e, i) => <g key={`r${i}`} transform="translate(118 0)">{e}</g>),
        ...[120, 200, 280, 360].map((y) => <circle key={y} cx={y % 160 ? 82 : 100} cy={y} r={7} fill={a} />),
      ];
    case 'twists':
      return Array.from({ length: 8 }, (_, i) => (
        <g key={i} fill="none" strokeLinecap="round">
          <path d={wave(62 + i * 39, 40, 470, 13)} stroke={s} strokeWidth={9} />
          <path d={wave(62 + i * 39, 40, 470, -13)} stroke={a} strokeWidth={7} opacity=".85" />
        </g>
      ));
    case 'locs':
      return Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={wave(55 + i * 32, 40, 300 + ((i * 37) % 170), 6, 30)} fill="none" stroke={i % 3 === 0 ? a : s} strokeWidth={13} strokeLinecap="round" />
      ));
    default:
      return [
        ...[150, 115, 80, 45].map((r) => <circle key={r} cx={200} cy={250} r={r} fill="none" stroke={s} strokeWidth={9} opacity={0.5 + r / 400} />),
        ...Array.from({ length: 44 }, (_, i) => <circle key={`d${i}`} cx={200 + Math.cos(i * 2.4) * (30 + ((i * 29) % 130))} cy={250 + Math.sin(i * 2.4) * (30 + ((i * 29) % 130))} r={5} fill={a} />),
      ];
  }
}

export function Art({ pattern, tone = 0 }: { pattern: Pattern; tone?: number }) {
  const [b1, b2, s, a] = tones[tone % tones.length];
  const id = `bg-${pattern}-${tone}`;
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={b1} />
          <stop offset="1" stopColor={b2} />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${id})`} />
      {body(pattern, s, a, b1)}
    </svg>
  );
}

interface VisualProps {
  src?: string;
  alt: string;
  pattern: Pattern;
  tone?: number;
  ratio?: string;
  className?: string;
  eager?: boolean;
}

// Shows a real photo when `src` is set, otherwise an on-brand illustrated placeholder.
export function Visual({ src, alt, pattern, tone = 0, ratio = '4/5', className = '', eager }: VisualProps) {
  const isVideo = !!src && /\.(mp4|webm)(?:$|[?#])/i.test(src);
  return (
    <div className={`relative overflow-hidden bg-beige ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={alt}>
      {isVideo ? <video src={src} muted autoPlay loop playsInline preload={eager ? 'auto' : 'metadata'} aria-hidden="true" className="h-full w-full object-cover" /> : src ? <img src={src} alt="" loading={eager ? 'eager' : 'lazy'} className="h-full w-full object-cover" /> : <Art pattern={pattern} tone={tone} />}
    </div>
  );
}
