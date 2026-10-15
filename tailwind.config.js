/** @type {import('tailwindcss').Config} */
// Colours are CSS custom properties (see src/index.css) so light/dark follow the
// system preference without `dark:` variants on every element.
const v = (name) => `var(--${name})`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: v('ground'),
        sheet: v('sheet'),
        well: v('well'),
        rule: v('rule'),
        'rule-strong': v('rule-strong'),
        ink: { DEFAULT: v('ink'), 2: v('ink-2'), 3: v('ink-3') },
        carbon: { DEFAULT: v('carbon'), hover: v('carbon-hover'), soft: v('carbon-soft'), on: v('carbon-on') },
        shell: { DEFAULT: v('shell'), ink: v('shell-ink'), dim: v('shell-dim') },
        in: { DEFAULT: v('in'), soft: v('in-soft') },
        out: { DEFAULT: v('out'), soft: v('out-soft') },
        warn: { DEFAULT: v('warn'), soft: v('warn-soft') },
      },
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sheet: '8px',
      },
    },
  },
  plugins: [],
}
