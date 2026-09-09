/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'rgb(var(--bg-rgb) / <alpha-value>)',
          900: 'rgb(var(--surface-rgb) / <alpha-value>)',
          850: 'rgb(var(--surface-2-rgb) / <alpha-value>)',
          800: 'rgb(var(--surface-3-rgb) / <alpha-value>)',
          700: 'rgb(var(--surface-3-rgb) / <alpha-value>)',
          600: 'rgb(var(--surface-2-rgb) / <alpha-value>)',
        },
        lilac: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          50: 'rgb(var(--accent-rgb) / <alpha-value>)',
          100: 'rgb(var(--accent-rgb) / <alpha-value>)',
          300: 'rgb(var(--accent-rgb) / <alpha-value>)',
          400: 'rgb(var(--accent-rgb) / <alpha-value>)',
          500: 'rgb(var(--accent-rgb) / <alpha-value>)',
          600: 'rgb(var(--accent-2-rgb) / <alpha-value>)',
          700: 'rgb(var(--accent-2-rgb) / <alpha-value>)',
        },
        emerald: {
          DEFAULT: 'rgb(var(--accent2-rgb) / <alpha-value>)',
          50: 'rgb(var(--accent2-rgb) / <alpha-value>)',
          100: 'rgb(var(--accent2-rgb) / <alpha-value>)',
          300: 'rgb(var(--accent2-rgb) / <alpha-value>)',
          400: 'rgb(var(--accent2-rgb) / <alpha-value>)',
          500: 'rgb(var(--accent2-rgb) / <alpha-value>)',
          600: 'rgb(var(--accent2-rgb) / <alpha-value>)',
          700: 'rgb(var(--accent2-rgb) / <alpha-value>)',
        },
        cream: 'rgb(var(--body-rgb) / <alpha-value>)',
        white: 'rgb(var(--heading-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-lilac': '0 0 0 1px rgb(var(--accent-rgb) / 0.4), 0 0 24px -4px rgb(var(--accent-rgb) / 0.5)',
        'glow-emerald': '0 0 0 1px rgb(var(--accent2-rgb) / 0.4), 0 0 24px -4px rgb(var(--accent2-rgb) / 0.5)',
        'glow-soft': '0 0 40px -8px rgb(var(--accent-rgb) / 0.25)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgb(var(--heading-rgb) / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--heading-rgb) / 0.05) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgb(var(--accent-rgb) / 0.10), transparent 60%)',
      },
      keyframes: {
        floatY: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        floatY: 'floatY 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        fadeUp: 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
