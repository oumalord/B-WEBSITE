// Central business configuration (defaults). Anything saved in the admin area overrides these.
// Details below come from the salon's public Instagram bio (@braidysaloon_roysambu). Salon owner: please verify.
export const site = {
  name: 'BRAIDY SALON',
  tagline: 'Where Beauty Meets Artistry.',
  altTagline: 'Your Hair. Your Crown. Your Style.',
  logoImage: '',
  heroImage: '', // e.g. '/resources/hero.jpg' once real photography is available
  contact: {
    whatsapp: '254746735544', // UNVERIFIED as a WhatsApp line: Roysambu number from Instagram bio
    phone: '+254 746 735 544',
    email: '',
    address: 'Lumumba Drive, behind Coolmat Supermarket, Roysambu, Nairobi. Second branch: Greenspot Towers, 5th Floor, Room 501, Kamakis (call 0701 523 133).',
    mapEmbedUrl: 'https://www.google.com/maps?q=Braidy+Salon+Lumumba+Drive+Roysambu+Nairobi&output=embed',
  },
  social: { instagram: 'https://www.instagram.com/braidysaloon_roysambu/', facebook: '' },
  hours: [{ days: 'Daily', time: 'from 7:00 am, last booking 7:00 pm' }],
  announcement: {
    enabled: true,
    text: 'Your next hairstyle is waiting for you.',
    linkLabel: 'Book your appointment today',
    linkTo: '/booking',
  },
  currency: 'KSh ',
  pricesAreSample: true, // set false once real prices are entered
  timeSlots: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00'],
};
