/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        lavender: {
          50: '#f5f0fa',
          100: '#ebe1f5',
          200: '#d9c7eb',
          300: '#B8A9C9',
          400: '#a08bb8',
          500: '#8a6fa8',
          600: '#755998',
          700: '#604488',
        },
        peach: {
          50: '#fef6f2',
          100: '#fdeee7',
          200: '#F5D5C8',
          300: '#f0bfa8',
          400: '#eba98a',
          500: '#e6936c',
        },
        cream: {
          50: '#FFF8F0',
          100: '#fff3e6',
          200: '#ffeedc',
          300: '#ffe4c8',
        },
        sage: {
          50: '#f2f7f0',
          100: '#e0ede0',
          200: '#c4dcc0',
          300: '#A8C5A0',
          400: '#8db484',
          500: '#72a368',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
