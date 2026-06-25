/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['attribute', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'brand-cyan':     'var(--accent-cyan)',
        'brand-amber':    'var(--accent-amber)',
        'brand-success':  'var(--success)',
        'surface':        'var(--bg-surface)',
        'surface-raised': 'var(--bg-surface-raised)',
        'void':           'var(--bg-void)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        sans:    ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.15em',
      },
      boxShadow: {
        'glow-cyan':  'var(--glow-cyan)',
        'glow-amber': 'var(--glow-amber)',
      },
    },
  },
  safelist: [
    'bg-void', 'bg-surface', 'bg-surface-raised',
    'text-primary', 'text-muted', 'text-cyan', 'text-amber', 'text-success', 'text-danger',
    'border-border', 'border-hover',
    'shadow-glow-cyan', 'shadow-glow-amber',
    'font-display', 'font-mono',
    'tracking-widest2',
    'animate-pulse-glow',
    'skeleton',

  ],
  plugins: [],
};
