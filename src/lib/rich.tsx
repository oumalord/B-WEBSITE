import { Fragment, type ReactNode } from 'react';

// Turns *word* into an emphasised (gold gradient) word.
export function rich(text: string): ReactNode {
  return text.split('*').map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>));
}
