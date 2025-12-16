/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f24405',
        secondary: '#f29f05',
        accent1: '#05dbf2',
        accent2: '#0597f2',
        accent3: '#5c64f2',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to avoid conflicts with Angular Material
  },
  darkMode: ['class', '[data-theme="dark"]'],
}

