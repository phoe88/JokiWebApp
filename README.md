# JokiWebApp

A web development and project service site, built with React, Vite, Tailwind CSS and Supabase. `/` is a landing page in Indonesian. Behind it is a working app: a service catalog, ordering, and a realtime order dashboard.

With no configuration it runs in demo mode on local seed data. Add a Supabase project to get real accounts, orders and realtime status tracking.

## Before you launch

The landing page will not invent facts about your business, so these need your input:

| What | Where | Until it's set |
| --- | --- | --- |
| WhatsApp number | `WHATSAPP_NUMBER` in `src/config/site.js` | The consultation form offers copy and the catalog instead of sending |
| Discord and Telegram links | `COMMUNITY_CHANNELS` in `src/config/site.js` | The community modal shows them as not open yet |
| Instagram and GitHub links | `SOCIAL_LINKS` in `src/config/site.js` | They stay out of the footer |
| Real projects | `PROJECTS` in `src/content/landing.js` | Entries with `sample: true` show a `Contoh` tag saying they are concepts |
| FAQ answers | `FAQS` in `src/content/landing.js` | They are general wording. Check them against how you actually work, especially revisions and privacy |

## Directory structure

```text
JokiWebApp/
├── .env.example                 Template for the two Supabase variables
├── index.html                   Entry page, Google Fonts
├── tailwind.config.js           Colour, font and elevation tokens
├── postcss.config.js
├── vite.config.js
├── public/
│   └── favicon.svg
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql        Tables, trigger, RLS, grants, realtime
│   └── seed.sql                 15 catalog services across 5 categories
└── src/
    ├── main.jsx                 Providers and Animate.css import
    ├── App.jsx                  Routes
    ├── index.css                Tokens, glass levels, landing, shell, motion, fallbacks
    ├── content/
    │   └── landing.js           All landing page copy, projects and FAQ
    ├── config/
    │   ├── site.js              WhatsApp, community and social links
    │   ├── brand.js             App name and tagline
    │   ├── catalog.js           Categories, covers, statuses, CTA labels
    │   └── nav.js               The app's nav links and page labels
    ├── lib/
    │   ├── SupabaseClient.js    Client and demo mode detection
    │   ├── orderMetrics.js      Every dashboard and pricing figure
    │   ├── chartGeometry.js     Scales and paths for the SVG charts
    │   ├── catalogLayout.js     Card spans, so the grid never has holes
    │   ├── format.js            IDR, date and id formatting
    │   └── terminalCommands.js  Pseudo-terminal commands
    ├── data/
    │   ├── seedServices.js      Demo catalog, mirrors supabase/seed.sql
    │   └── demoOrders.js        Sample orders and the feed simulator
    ├── services/
    │   ├── catalog.js           Service and counter queries
    │   └── orders.js            Order queries and realtime subscription
    ├── context/
    │   ├── AuthContext.jsx      Session, sign in/up/out, login modal state
    │   ├── CatalogContext.jsx   Catalog shared across pages
    │   ├── ConnectionContext.jsx  Realtime state for the header
    │   └── ToastContext.jsx     Notifications
    ├── hooks/
    │   ├── useMyOrders.js       The user's orders, kept live over Realtime
    │   ├── useOrderAction.js    Order button flow
    │   ├── useActiveSection.js  Which landing section is on screen
    │   ├── useInView.js         Scroll reveal trigger
    │   ├── useCountUp.js        Eases figures to their value
    │   ├── useElementSize.js    Measures a chart's box
    │   ├── useGridColumns.js    Current catalog column count
    │   └── usePrefersReducedMotion.js
    ├── components/
    │   ├── landing/             SiteNav, Hero, CodeWindow, the sections, ConsultModal, SiteFooter
    │   ├── shell/               AppShell, Sidebar, TopBar, TabBar, Logo, account, glow
    │   ├── charts/              TrendChart, Sparkline, ProgressRing, CategoryBars, tooltip
    │   ├── dashboard/           StatTile, TrendPanel, CompletionPanel, CategoryPanel, OrdersPanel
    │   ├── Modal.jsx            Shared dialog
    │   ├── ServiceCatalog.jsx   Category tabs and service grid
    │   ├── ServiceCard.jsx      Standard, wide and poster card shapes
    │   ├── LoginModal.jsx       Email and password auth
    │   └── ...                  Badges, notices, buttons and other small parts
    └── pages/
        ├── Landing.jsx          /
        ├── Services.jsx         /services
        ├── Dashboard.jsx        /dashboard
        ├── LiveFeed.jsx         /live-feed
        ├── Pricing.jsx          /pricing
        ├── Terminal.jsx         /terminal
        └── NotFound.jsx
```

## Run it locally

You need Node 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Without a `.env` file the app runs in demo mode and shows a `DEMO DATA` tag in the navbar.

To build for production:

```bash
npm run build
npm run preview
```

If `npm` is not on your PATH but Corepack is, this works the same way. The repository's lockfile is `pnpm-lock.yaml`.

```bash
corepack pnpm@latest install
corepack pnpm@latest run dev
```

## Connect Supabase

### 1. Create the project

Create a project at [supabase.com](https://supabase.com) and wait for the database to finish starting.

### 2. Set the environment variables

```bash
cp .env.example .env
```

Fill in both values from **Project Settings > API**:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | The project URL |
| `VITE_SUPABASE_ANON_KEY` | The anon (public) key |

Restart the dev server after changing `.env`. Never use the `service_role` key here: every `VITE_` variable ends up in the browser bundle. `.env` is ignored by git.

### 3. Run the migration

Open **SQL Editor**, paste in `supabase/migrations/0001_init.sql` and run it. It is safe to run again.

It creates the three tables, the signup trigger, the RLS policies, the grants, the counter function, and adds `orders` to the `supabase_realtime` publication.

### 4. Load the seed data

In the SQL Editor, run `supabase/seed.sql`. It is also safe to run again, and it updates the seeded rows in place.

With the Supabase CLI linked to your project, `supabase db push` applies the migration instead. Run the seed separately.

### 5. Enable email auth

1. Go to **Authentication > Sign In / Providers** and make sure **Email** is enabled.
2. Go to **Authentication > URL Configuration** and set **Site URL** to your app's address. For local work, use `http://localhost:5173`. Add any other addresses under **Redirect URLs**.
3. Decide whether to keep **Confirm email** on. With it on, new users must open the link in their inbox before signing in, and the app tells them so. With it off, they are signed in straight away.

The default Supabase email service has a low hourly limit, so set up custom SMTP before launch.

### 6. Check realtime

Sign in, place an order and open `/dashboard`. The badge in the header should read `Realtime linked`. Then move the order forward in the SQL Editor. The dashboard and `/live-feed` update with no reload:

```sql
update public.orders set status = 'in_progress' where id = '<order id>';
update public.orders set status = 'completed' where id = '<order id>';
```

Clients can't change order status, so this is also how orders move on today (see Known limitations). Completed orders feed the counters on the service cards. An open Dashboard or Live Feed refreshes the counters when one of your own orders completes.

## Design system

Dark glass on near-black, lit by neon green and cyan. Tokens live as CSS variables at the top of `src/index.css`, and `tailwind.config.js` maps them to utility names.

### Colour roles

| Token | Tailwind | Role |
| --- | --- | --- |
| `--live`, `--live-deep` | `live`, `live-deep` | Neon green `#00FF66`: live, positive, success |
| `--cyber`, `--cyber-deep`, `--cyber-soft` | `cyber`, `cyber-deep`, `cyber-soft` | Cyan `#00F0FF`: highlights, in-progress, secondary actions |
| `--accent-gradient` | none | Green to cyan: primary buttons and gradient text |
| `--ink`, `--ink-muted`, `--ink-dim` | `ink`, `ink-muted`, `ink-dim` | Text ramp |
| `--danger` | `danger` | Errors |
| `--series-placed`, `--series-completed` | none | Chart series, separate from the UI accents |

The neon accents are too bright to chart with, so the two series are `#0aa5c0` and `#22a447`. They pass the dataviz palette validator in dark mode against the panel surface (`#141414`), including colour-blind separation. Re-run it if either changes.

### Glass

| Class | Level | Use |
| --- | --- | --- |
| `.glass-soft` | 1 | Notices, FAQ items |
| `.glass` | 2 | Panels and cards |
| `.glass-raised` | 3 | Modals, toasts, tab bar |
| `.glass-inset` | none | Wells inside a panel. It has no blur, so glass never nests |

`.lift` adds the app's card hover, and `GlowCard` the landing page's pointer-tracking border. Fallbacks are in the same file: `@supports not (backdrop-filter)` and `prefers-reduced-transparency` swap in solid panels, and `forced-colors` keeps visible borders.

Rules outside `@layer components` come after Tailwind's base utilities, so a plain `hidden` won't override them. Breakpoint variants like `xl:hidden` still do.

### Type

Plus Jakarta Sans for display, Inter for body, Fira Code for code and small technical labels. `.figures` sets tabular numerals where numbers line up in columns, axes and tooltips.

### Motion

The signature hover is `ScrambleText`, which breaks a label into code glyphs and resolves it, with `.glitch-text` splitting its colours for a moment. Add `.glitch-host` to the element that should trigger it. `Reveal` fades sections in on scroll, and Animate.css `fadeInUp` handles app entrances. Under `prefers-reduced-motion` all of it stops, including the hero's typing, and everything shows in its final state.

### Charts

Charts are hand-written SVG in `src/components/charts/`, with no chart library. Pure geometry is in `chartGeometry.js` and every number comes from `orderMetrics.js`. The rules they follow: one y-axis, 2px lines, thin rounded bars, a hairline grid, a legend for two or more series, and ink colours for text. Tooltips work on hover, touch and keyboard, and the Dashboard's orders table is the table view of every chart.

### Layout

The landing page has its own sticky nav, mobile drawer and footer, and `.page-shell` sets its width. App pages share `AppShell`: from `lg` a floating sidebar, which gains labels at `xl`, and below `lg` a fixed tab bar. `--frame-max` (120rem) caps their width while the glow stays full bleed. `catalogLayout.js` picks each card's span so the grid ends on a full row for any filter result, and `useGridColumns` must stay in step with the `GRID` classes in `ServiceCatalog.jsx`.

### Honest data

- The landing page makes no claims it can't back: no client counts, ratings, testimonials or logos.
- Dashboard figures come from orders and the catalog, and order value is always labelled as an estimate at current prices.
- Anything built from demo data carries a visible `DEMO` or `SIMULATED` label, and sample projects a `Contoh` tag.
- Accounts with 0 or 1 orders get a plain statement instead of a padded chart.

## How the data is protected

| Table | anon | authenticated |
| --- | --- | --- |
| `profiles` | none | Read own row, update own `username` only |
| `services` | Read | Read |
| `orders` | none | Read own rows, insert own rows as `pending` |

- Column-level grants, not only policies, stop users from rewriting `profiles.id`, `profiles.email` or `orders.created_at`.
- `service_completed_counts()` is the only public view of order data. It returns `(service_id, completed_count)` aggregates and nothing else.
- `profiles.username` is limited to 64 characters. It stays nullable, because an account can have no username and no email to derive one from.
- `services.price` rejects `NaN` and `Infinity` as well as negative values.

## Repair an account with no profile

The signup trigger logs a warning instead of failing the signup, so a database fault can leave an account with no `profiles` row. That account can sign in, but every order fails with a message telling the user to contact support. The client can't fix this, because users can't insert profiles.

To repair every affected account, run `supabase/migrations/0001_init.sql` again. Its backfill creates the missing rows and leaves existing ones alone. To find them first:

```sql
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
```

## Known limitations

- **Order values are estimates.** `orders` stores no price, so a value is the service's current price and changes if the price does. An order whose service was deleted is left out of the estimates, and the Dashboard says how many.
- **"Completed" charts by order date.** There is no completion timestamp, so the chart's completed series means placed in that period and completed by now.
- **The range tabs scope the Order value chart only.** The stat tiles, ring and category bars always cover all orders.
- **There is no payment.** An order is a `pending` row and no money changes hands. The Pricing page says so.
- **There is no admin interface.** Moving an order to `in_progress` or `completed` takes SQL, the dashboard or a `service_role` backend.
- **Not yet tested on hosted Supabase.** The migration was tested on local PostgreSQL 18 with stand-ins for Supabase's roles and `auth` schema, and the client was tested against a local fake of its REST, Auth and Realtime APIs. Follow step 6 above to confirm your project end to end.
- **Live Feed has no history.** `orders` has no `updated_at` or event table, so the feed only logs changes that happen while the page is open. The current status panel shows where each order stands.
- **Completed counters can lag.** They load with the app and refresh when one of your own orders completes while Dashboard or Live Feed is open. Other customers' completions appear after a page reload.
- **There is no support channel.** The missing-profile error tells users to contact support, but the app has no contact link. Add one before launch.
- **`profiles.email` is a signup snapshot.** It does not follow later email changes in Supabase Auth.
- **Orders have no rate limit.** A signed-in user can create as many `pending` orders as they like, and the same service can be ordered twice.
- **Profiles can't be edited in the UI.** The database allows username updates, but no screen offers one, and password reset is not built.
- **Seed data lives in two places.** `src/data/seedServices.js` and `supabase/seed.sql` hold the same rows, so edit both together.
- **Seeded services have no images.** `image_url` is null and cards draw a generated pattern. A real URL in that column replaces the pattern.
- **Hosting needs an SPA fallback.** Rewrite unknown paths to `index.html`, or direct links such as `/dashboard` will return 404.
- **Fonts load from Google Fonts.** Offline, the app falls back to system fonts.
- **The site is in two languages.** The landing page is Indonesian, while the app pages and the seeded catalog are English.
- **The consultation form sends nothing by itself.** It hands the brief to WhatsApp once `WHATSAPP_NUMBER` is set, and nothing is stored.
