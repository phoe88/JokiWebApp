import portrait from '../assets/founder-phoe88.webp';
import portraitSmall from '../assets/founder-phoe88-640.webp';

/** The founder profile section on the landing page. */
export const FOUNDER = {
  label: 'Meet the founder',
  heading: 'Building Digital Experiences, One Solution at a Time.',
  name: 'Phoe88',
  role: 'CEO & Founder of JokiWebApp',
  identity: 'Technology Entrepreneur & Digital Solutions Enthusiast',
  bio: [
    'Behind JokiWebApp is Phoe88, the founder and CEO who believes that technology should make digital experiences more accessible, efficient, and impactful.',
    'With an interest in web development, digital innovation, and technology-driven solutions, Phoe88 leads the vision of JokiWebApp in delivering modern digital products that combine functionality, usability, and thoughtful design.',
  ],
  portrait: {
    src: portrait,
    srcSet: `${portraitSmall} 640w, ${portrait} 1086w`,
    width: 1086,
    height: 1448,
    alt: 'Portrait of Phoe88, CEO and Founder of JokiWebApp, in a black suit with arms crossed',
  },
};

/**
 * The stack behind JokiWebApp. Each `name` must match an entry in techStack.js so
 * its logo shows.
 */
export const FOUNDER_STACK = [
  { name: 'React', role: 'Frontend' },
  { name: 'Laravel', role: 'Backend' },
  { name: 'Tailwind CSS', role: 'Styling' },
  { name: 'Supabase', role: 'Auth & storage' },
  { name: 'PostgreSQL', role: 'Database' },
  { name: 'Node.js', role: 'Runtime & tooling' },
];
