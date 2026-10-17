import type { Pattern } from '../components/Art';

export interface Service {
  id: string;
  name: string;
  description: string;
  pattern: Pattern;
  tone: number;
  from?: number; // SAMPLE price until supplied
  duration?: string; // SAMPLE duration until supplied
  image?: string;
  images?: string[];
}

export const services: Service[] = [
  { id: 'knotless', name: 'Knotless Braids', description: 'Lightweight, seamless braids that start flat at the root for a natural, comfortable finish.', pattern: 'plaits', tone: 0, from: 120, duration: '5–7 hrs' },
  { id: 'box', name: 'Box Braids', description: 'A timeless protective classic, available in many lengths, sizes and colours.', pattern: 'box', tone: 1, from: 100, duration: '4–6 hrs' },
  { id: 'cornrows', name: 'Cornrows', description: 'Sleek, sculpted patterns from simple straight-backs to intricate custom designs.', pattern: 'cornrows', tone: 2, from: 60, duration: '2–4 hrs' },
  { id: 'feedin', name: 'Feed-In Braids', description: 'Gradual extension feeding for a smooth, natural-looking hairline.', pattern: 'cornrows', tone: 3, from: 80, duration: '3–5 hrs' },
  { id: 'fulani', name: 'Fulani Braids', description: 'Heritage-inspired centre cornrows with side braids, finished with optional beads.', pattern: 'fulani', tone: 0, from: 110, duration: '4–6 hrs' },
  { id: 'twists', name: 'Twist Hairstyles', description: 'Passion, Senegalese and spring twists with beautiful movement and texture.', pattern: 'twists', tone: 1, from: 100, duration: '4–6 hrs' },
  { id: 'locs', name: 'Faux Locs', description: 'Soft, lightweight locs for a bold, versatile protective look.', pattern: 'locs', tone: 2, from: 130, duration: '5–7 hrs' },
  { id: 'natural', name: 'Natural Hair Styling', description: 'Wash, set and styling that celebrates and protects your natural texture.', pattern: 'natural', tone: 3, from: 50, duration: '1–3 hrs' },
];

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Knotless' | 'Cornrows' | 'Box Braids' | 'Twists';
  service: string;
  pattern: Pattern;
  tone: number;
  ratio: string;
  image?: string; // replace with real salon photography
}

export const galleryCategories = ['All Styles', 'Knotless', 'Cornrows', 'Box Braids', 'Twists'] as const;

export const gallery: GalleryItem[] = [
  { id: 'g1', title: 'Waist-length knotless', category: 'Knotless', service: 'knotless', pattern: 'plaits', tone: 0, ratio: '4/5' },
  { id: 'g2', title: 'Sculpted cornrow design', category: 'Cornrows', service: 'cornrows', pattern: 'cornrows', tone: 2, ratio: '1/1' },
  { id: 'g3', title: 'Classic medium box braids', category: 'Box Braids', service: 'box', pattern: 'box', tone: 1, ratio: '3/4' },
  { id: 'g4', title: 'Passion twists', category: 'Twists', service: 'twists', pattern: 'twists', tone: 3, ratio: '4/5' },
  { id: 'g5', title: 'Fulani with beads', category: 'Cornrows', service: 'fulani', pattern: 'fulani', tone: 0, ratio: '3/4' },
  { id: 'g6', title: 'Shoulder-length knotless', category: 'Knotless', service: 'knotless', pattern: 'plaits', tone: 1, ratio: '1/1' },
  { id: 'g7', title: 'Soft faux locs', category: 'Twists', service: 'locs', pattern: 'locs', tone: 2, ratio: '4/5' },
  { id: 'g8', title: 'Jumbo box braids', category: 'Box Braids', service: 'box', pattern: 'box', tone: 3, ratio: '1/1' },
  { id: 'g9', title: 'Feed-in stitch braids', category: 'Cornrows', service: 'feedin', pattern: 'cornrows', tone: 1, ratio: '3/4' },
];

export const faqs = [
  { q: 'How do I book an appointment?', a: 'Choose a service on the booking page and send your request. The salon will reply to confirm availability. Your appointment is only confirmed once you hear back.' },
  { q: 'How long does braiding take?', a: 'It depends on the style, size and length. Estimated durations are shown on each service. [Sample: confirm with salon owner]' },
  { q: 'Should I arrive with my hair washed?', a: 'Many stylists prefer clean, detangled, blow-dried hair. [Sample: confirm preparation instructions with salon owner]' },
  { q: 'Do I need to bring my own extensions?', a: 'Please ask when booking so the salon can tell you what is included. [To be confirmed by salon owner]' },
  { q: 'What is your cancellation policy?', a: '[To be confirmed by salon owner. Add notice period and any deposit terms here.]' },
  { q: 'How can I find the salon?', a: 'Address and directions will appear on the Contact page once supplied by the salon.' },
  { q: 'Which payment methods do you accept?', a: '[To be confirmed by salon owner.]' },
];

export interface Testimonial { name: string; text: string; rating?: number }
// Add real, approved testimonials (also possible from the admin area). The section stays hidden while this list is empty.
export const testimonials: Testimonial[] = [];
