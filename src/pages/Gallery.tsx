import { PageHeader } from '../components/ui';
import GalleryGrid from '../components/GalleryGrid';
import { copy } from '../data/copy';
import { usePageMeta } from '../lib/meta';

export default function Gallery() {
  usePageMeta('Gallery', 'Browse BRAIDY SALON hairstyles: knotless, cornrows, box braids and twists.');
  return (
    <>
      <PageHeader eyebrow="Portfolio" title={copy.gallery.title}>{copy.gallery.intro}</PageHeader>
      <section className="section"><div className="wrap"><GalleryGrid /></div></section>
    </>
  );
}
