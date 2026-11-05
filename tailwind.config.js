/** Colours resolve to the channels in src/index.css, so opacity modifiers keep working. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: token('obsidian'),
        ink: {
          DEFAULT: token('ink'),
          muted: token('ink-muted'),
          dim: token('ink-dim'),
        },
        cyber: {
          DEFAULT: token('cyber'),
          deep: token('cyber-deep'),
          soft: token('cyber-soft'),
        },
        live: {
          DEFAULT: token('live'),
          deep: token('live-deep'),
        },
        danger: token('danger'),
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
      },
    },
  },
  plugins: [],
};
