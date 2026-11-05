import { APP_NAME } from '../config/brand';
import { formatIDR } from './format';

const PAGES = {
  home: '/',
  dashboard: '/dashboard',
  services: '/services',
  'live-feed': '/live-feed',
  pricing: '/pricing',
  terminal: '/terminal',
};

const HELP = [
  ['help', 'list available commands'],
  ['services [text]', 'list the catalog, optionally filtered'],
  ['status', 'show backend, session and order state'],
  ['whoami', 'show the signed-in account'],
  ['goto <page>', `open a page: ${Object.keys(PAGES).join(', ')}`],
  ['clear', 'clear the screen'],
];

export const COMMAND_NAMES = ['help', 'services', 'status', 'whoami', 'goto', 'clear'];
export const PAGE_NAMES = Object.keys(PAGES);

export const BANNER = [
  { tone: 'ok', text: `${APP_NAME} pseudo-terminal` },
  { tone: 'dim', text: 'This is a UI toy. Nothing typed here runs on any machine.' },
  { tone: 'dim', text: "Type 'help' to list commands." },
];

const line = (text, tone = 'out') => ({ text, tone });

function services(args, { catalog }) {
  const filter = args.join(' ').toLowerCase();
  const matches = catalog.filter((service) =>
    `${service.title} ${service.category}`.toLowerCase().includes(filter),
  );

  if (matches.length === 0) return [line(`no services match '${filter}'`, 'warn')];

  return [
    ...matches.map((service) => line(`[${service.status}] ${service.title} :: ${formatIDR(service.price)}`)),
    line(`${matches.length} of ${catalog.length} services`, 'dim'),
  ];
}

async function status({ demo, user, catalog, loadOrders }) {
  const lines = [
    line(`backend  ${demo ? 'DEMO DATA (Supabase not configured)' : 'Supabase'}`, demo ? 'warn' : 'ok'),
    line(`session  ${user ? user.email : 'none'}`),
    line(`catalog  ${catalog.length} services`),
  ];

  if (demo) return [...lines, line('orders   unavailable in demo mode', 'dim')];
  if (!user) return [...lines, line('orders   sign in to view', 'dim')];

  try {
    const orders = await loadOrders();
    const tally = (value) => orders.filter((order) => order.status === value).length;
    return [
      ...lines,
      line(
        `orders   ${tally('pending')} pending, ${tally('in_progress')} in progress, ${tally('completed')} completed`,
      ),
    ];
  } catch (error) {
    return [...lines, line(`orders   ${error.message}`, 'err')];
  }
}

function resolvePage(target = '') {
  const normalized = target.toLowerCase().replace(/^\//, '').replace(/[\s_]/g, '-');
  if (normalized === '' || normalized === 'landing') return PAGES.home;
  if (normalized === 'livefeed') return PAGES['live-feed'];
  return Object.hasOwn(PAGES, normalized) ? PAGES[normalized] : undefined;
}

/**
 * Pure command dispatcher. Returns { lines, clear?, navigate? }.
 * It only reads the app state in `context`; nothing is ever executed.
 */
export async function runCommand(input, context) {
  const [rawCommand, ...args] = input.trim().split(/\s+/);
  const command = rawCommand.toLowerCase();

  switch (command) {
    case 'help':
      return { lines: HELP.map(([name, about]) => line(`${name.padEnd(17)} ${about}`)) };
    case 'services':
      return { lines: services(args, context) };
    case 'status':
      return { lines: await status(context) };
    case 'whoami':
      return { lines: [line(context.user ? context.user.email : 'guest (not signed in)')] };
    case 'clear':
      return { clear: true, lines: [] };
    case 'goto': {
      if (args.length === 0) return { lines: [line(`usage: goto <${PAGE_NAMES.join('|')}>`, 'warn')] };
      const path = resolvePage(args[0]);
      if (!path) return { lines: [line(`unknown page '${args[0]}'`, 'err')] };
      return { lines: [line(`routing to ${path}`, 'ok')], navigate: path };
    }
    default:
      return { lines: [line(`command not found: ${rawCommand}. Type 'help'.`, 'err')] };
  }
}

/** Completes the current word, returning the input unchanged if nothing fits. */
export function completeInput(input) {
  const parts = input.trimStart().split(/\s+/);

  if (parts.length === 1) {
    const matches = COMMAND_NAMES.filter((name) => name.startsWith(parts[0].toLowerCase()));
    return matches.length === 1 ? `${matches[0]} ` : input;
  }

  if (parts.length === 2 && parts[0].toLowerCase() === 'goto') {
    const matches = PAGE_NAMES.filter((name) => name.startsWith(parts[1].toLowerCase()));
    return matches.length === 1 ? `goto ${matches[0]}` : input;
  }

  return input;
}
