/**
 * Where visitors reach you. An empty value keeps its button honest: it shows as
 * not open yet instead of linking nowhere. Fill these in before launch.
 */

/** Digits with the country code and no plus sign, such as 6281234567890. */
export const WHATSAPP_NUMBER = '6287796844801';

export const COMMUNITY_CHANNELS = [
  { name: 'Discord', url: '', note: 'Diskusi, review kode, dan belajar bareng.' },
  { name: 'Telegram', url: '', note: 'Update dan pengumuman langsung.' },
];

export const SOCIAL_LINKS = [
  { name: 'Instagram', url: '' },
  { name: 'GitHub', url: '' },
];

/**
 * The song search endpoint (api/youtube-search.js, hosted on Vercel). GitHub Pages
 * has no server, so its build points VITE_MUSIC_SEARCH_URL at the Vercel copy.
 */
export const MUSIC_SEARCH_URL = import.meta.env.VITE_MUSIC_SEARCH_URL || '/api/youtube-search';
