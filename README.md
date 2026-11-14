# JokiWebApp

A web development and project service site in Indonesian, built with React, Vite and Tailwind CSS. `/` is the landing page, and `/templates` lets visitors browse website templates. There is no backend or login: every page is static, and orders and consultations go out over WhatsApp.

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
├── index.html                   Entry page, Google Fonts
├── tailwind.config.js           Colour, font and elevation tokens
├── vite.config.js
├── vercel.json                  SPA rewrite for Vercel
├── public/
├── supabase/                    Schema from the earlier app's database (unused by the site now)
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
    ├── context/ToastContext.jsx Notifications
    ├── hooks/                   Active section, scroll reveal, reduced motion
    ├── components/
    │   ├── landing/             SiteNav, Hero, CodeWindow, the sections, ConsultModal, SiteFooter, ScrambleText
    │   ├── shell/               Logo, SitePage, glow
    │   ├── Modal.jsx            Shared dialog
    │   └── Notice.jsx           Empty and error panels
    └── pages/
        ├── Landing.jsx          /
        ├── Templates.jsx        /templates
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
- **The earlier Supabase project still exists.** The site no longer connects to it. Its tables, accounts and the `VITE_SUPABASE_*` variables in GitHub Actions and Vercel are left in place so nothing is lost; delete them if you don't need them.
- **Hosting needs an SPA fallback.** Rewrite unknown paths to `index.html`, or direct links such as `/templates` return 404. `vercel.json` does this on Vercel. The GitHub Pages workflow in `.github/workflows/deploy.yml` copies `index.html` to `404.html` and sets `BASE_PATH` to the repo name.
- **Fonts load from Google Fonts.** Offline, the site falls back to system fonts.
- **The consultation form sends nothing by itself.** It hands the brief to WhatsApp once `WHATSAPP_NUMBER` is set.
