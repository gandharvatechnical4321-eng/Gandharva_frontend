/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust based on your file structure
  ],
  theme: {
    theme: {
      extend: {
        animation: {
          blink: "blink 1s infinite",
          'slide-fade-in-out': 'slideFadeInOut 3s ease-in-out',
        },
        keyframes: {
          blink: {
            "50%": { opacity: 0 },
          },
          slideFadeInOut: {
            '0%': { opacity: 0, transform: 'translateY(-10px)' },
            '10%': { opacity: 1, transform: 'translateY(0)' },
            '90%': { opacity: 1, transform: 'translateY(0)' },
            '100%': { opacity: 0, transform: 'translateY(-10px)' },
          },
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}