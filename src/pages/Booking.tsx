import { PageHeader } from '../components/ui';
import BookingForm from '../components/BookingForm';
import { copy } from '../data/copy';
import { usePageMeta } from '../lib/meta';

export default function Booking() {
  usePageMeta('Book Appointment', 'Request an appointment at BRAIDY SALON. Choose your style, date and time.');
  return (
    <>
      <PageHeader eyebrow="Booking" title={copy.booking.title}>{copy.booking.text}</PageHeader>
      <section className="section bg-plum-deep"><div className="wrap max-w-3xl"><BookingForm /></div></section>
    </>
  );
}
