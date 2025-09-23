// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'iopn-dark-blue': '#0f112a',
        'iopn-medium-blue': '#1d2449',
        'iopn-purple': '#6105b6',
        'iopn-purple-dark': '#5305b6',
        'iopn-light-blue': '#b0efff',
        'iopn-accent-blue': '#2280cd',
        'iopn-accent-purple': '#6305b6',
        'iopn-gray': '#4f5262',
        'iopn-light': '#f8f6f1',
      }
    },
  },
  plugins: [],
}