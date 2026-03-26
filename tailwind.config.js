/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d9488',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#f97316',
          foreground: '#ffffff',
        },
        background: '#0f172a',
        foreground: '#f8fafc',
        card: {
          DEFAULT: '#1e293b',
          foreground: '#f8fafc',
        },
        muted: {
          DEFAULT: '#334155',
          foreground: '#94a3b8',
        },
        border: '#334155',
      },
    },
  },
  plugins: [],
}
