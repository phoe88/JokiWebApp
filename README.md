# JokiWebApp

A web development and project service site in Indonesian, built with React, Vite, Tailwind CSS and Supabase. `/` is the landing page. Signed-in visitors can browse website templates at `/templates`.

Supabase provides the accounts. Without it the site still runs, but login explains that accounts aren't available yet, and the template page can't be opened.

## Before you launch

The site will not invent facts about your business, so these need your input:

| What | Where | Until it's set |
| --- | --- | --- |
| WhatsApp number | `WHATSAPP_NUMBER` in `src/config/site.js` | The consultation form offers copy instead of sending, and templates have no order button |
| Discord and Telegram links | `COMMUNITY_CHANNELS` in `src/config/site.js` | The community modal shows them as not open yet |
| Instagram and GitHub links | `SOCIAL_LINKS` in `src/config/site.js` | They stay out of the footer |
| Real projects | `PROJECTS` in `src/content/landing.js` | Entries with `sample: true` show a `Contoh` tag saying they are concepts |
| Real templates | `TEMPLATES` in `src/content/templates.js` | Every template is a concept and shows a `Contoh` tag |
| FAQ answers | `FAQS` in `src/content/landing.js` | They are general wording. Check them against how you actually work, especially revisions and privacy |

## Directory structure

```text
JokiWebApp/
├── .env.example                 Template for the two Supabase variables
├── index.html                   Entry page, Google Fonts
├── tailwind.config.js           Colour, font and elevation tokens
├── vite.config.js
├── vercel.json                  SPA rewrite for Vercel
├── public/
├── supabase/
│   ├── migrations/0001_init.sql Tables, signup trigger, RLS, grants
│   └── seed.sql                 Catalog rows from the earlier app (unused by the site now)
└── src/
    ├── main.jsx                 Providers and Animate.css import
    ├── App.jsx                  Routes and page titles
    ├── index.css                Tokens, glass levels, landing, motion, fallbacks
    ├── content/
    │   ├── landing.js           Landing page copy, projects, community topics, FAQ
    │   └── templates.js         Template categories and entries
    ├── config/
    │   ├── site.js              WhatsApp, community and social links
    │   └── brand.js             App name and tagline
    ├── lib/SupabaseClient.js    Client and demo mode detection
    ├── context/
    │   ├── AuthContext.jsx      Session, sign in/up/out, login modal state
    │   └── ToastContext.jsx     Notifications
    ├── hooks/                   Active section, scroll reveal, reduced motion
    ├── components/
    │   ├── landing/             SiteNav, Hero, CodeWindow, the sections, ConsultModal, SiteFooter, ScrambleText
    │   ├── shell/               Logo, AccountControl, SitePage, glow
    │   ├── LoginModal.jsx       Email and password auth
    │   ├── TemplateLink.jsx     Link to /templates that asks for login first
    │   ├── SignInGate.jsx       Shown in place of a page that needs an account
    │   ├── Modal.jsx            Shared dialog
    │   └── Notice.jsx           Empty, error and signed-out panels
    └── pages/
        ├── Landing.jsx          /
        ├── Templates.jsx        /templates, signed in only
        └── NotFound.jsx
```

## Run it locally

You need Node 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open http://localhost:5173. To build for production:

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

1. Create a project at [supabase.com](https://supabase.com).
2. `cp .env.example .env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings > API**. Never use the `service_role` key here: every `VITE_` variable ends up in the browser bundle. Restart the dev server afterwards.
3. In **SQL Editor**, run `supabase/migrations/0001_init.sql`. It creates the `profiles` table and the signup trigger that fills it. It is safe to run again.
4. Under **Authentication > Sign In / Providers**, make sure **Email** is enabled. Under **Authentication > URL Configuration**, set **Site URL** to the app's address and add any others under **Redirect URLs**.
5. Decide whether to keep **Confirm email** on. With it on, new users must open the link in their inbox before signing in, and the login form tells them so.

The default Supabase email service has a low hourly limit, so set up custom SMTP before launch.

## How login works

- The navbar's **Masuk** button opens the login form. Once signed in, it becomes the account's initials and a sign-out button.
- **Mulai cari template website**, and every other link to `/templates`, goes through `TemplateLink`. Signed-in visitors go straight there. Signed-out visitors get the login form first and land on `/templates` once they're in.
- Opening `/templates` directly while signed out shows `SignInGate` instead of the templates.
- Supabase's English error messages are translated in `LoginModal.jsx`. Add a line to `AUTH_ERRORS` for any new message that shows up in English.

## Design system

Dark glass on near-black, lit by neon green and cyan. Tokens live as CSS variables at the top of `src/index.css`, and `tailwind.config.js` maps them to utility names.

| Token | Tailwind | Role |
| --- | --- | --- |
| `--live`, `--live-deep` | `live`, `live-deep` | Neon green `#00FF66`: live, positive, selected |
| `--cyber`, `--cyber-deep`, `--cyber-soft` | `cyber`, `cyber-deep`, `cyber-soft` | Cyan `#00F0FF`: highlights and secondary actions |
| `--accent-gradient` | none | Green to cyan: primary buttons and gradient text |
| `--ink`, `--ink-muted`, `--ink-dim` | `ink`, `ink-muted`, `ink-dim` | Text ramp |
| `--danger` | `danger` | Errors |

Glass comes in `.glass-soft`, `.glass`, `.glass-raised` and `.glass-inset` (no blur, so glass never nests). `@supports not (backdrop-filter)` and `prefers-reduced-transparency` swap in solid panels, and `forced-colors` keeps visible borders.

Type is Plus Jakarta Sans for display, Inter for body, and Fira Code for small technical labels.

The signature hover is `ScrambleText`, which breaks a label into code glyphs and resolves it. Each glyph sits in a cell locked to the width of the letter it replaces, so labels never shrink or push their neighbours. Add `.glitch-host` to the element that should trigger it. `Reveal` fades sections in on scroll, and Animate.css `fadeInUp` handles entrances. Under `prefers-reduced-motion` all of it stops.

The landing page makes no claims it can't back: no client counts, ratings, testimonials or logos. Sample projects and templates carry a `Contoh` tag.

## Known limitations

- **Templates are concepts.** The previews are drawings, not live demos, and ordering one opens WhatsApp with the template's name. Nothing is stored.
- **The earlier app's tables are still in the database.** `services` and `orders` are no longer read by the site. They are left in place so no data is lost; drop them in Supabase if you don't need them.
- **Password reset is not built.** Neither is editing a username after signup.
- **Hosting needs an SPA fallback.** Rewrite unknown paths to `index.html`, or direct links such as `/templates` return 404. `vercel.json` does this on Vercel. The GitHub Pages workflow in `.github/workflows/deploy.yml` copies `index.html` to `404.html` and sets `BASE_PATH` to the repo name. It reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the repo's Actions variables.
- **Fonts load from Google Fonts.** Offline, the site falls back to system fonts.
- **The consultation form sends nothing by itself.** It hands the brief to WhatsApp once `WHATSAPP_NUMBER` is set.
