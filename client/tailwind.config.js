/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--bg)',
          warm: 'var(--bg-warm)',
          card: 'var(--bg-card)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          mid: 'var(--accent-mid)',
        },
        coral: 'var(--coral)',
        peach: 'var(--peach)',
        lavender: 'var(--lavender)',
        mint: 'var(--mint)',
        sky: 'var(--sky)',
        honey: 'var(--honey)',
        rose: 'var(--rose)',
        'text-dark': 'var(--text-dark)',
        'text-body': 'var(--text-body)',
        'text-soft': 'var(--text-soft)',
        'text-faint': 'var(--text-faint)',
      },
      borderRadius: {
        card: 'var(--radius)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        heavy: 'var(--shadow-heavy)',
        'smooth': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 1px 4px -1px rgba(0, 0, 0, 0.06)',
        'smooth-lg': '0 10px 24px -6px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'smooth-xl': '0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
