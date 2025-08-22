/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef7ff",
          100: "#fdeeff",
          200: "#fbdcff",
          300: "#f7c3ff",
          400: "#f19bff",
          500: "#e86cff",
          600: "#d842f7",
          700: "#c02ae3",
          800: "#9f25ba",
          900: "#822396",
          950: "#560e73",
        },
      },
      animation: {
        "bounce-subtle": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};
