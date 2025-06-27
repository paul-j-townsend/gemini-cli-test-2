/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'vet-teal': '#03A6A1',
        'vet-cream': '#FFE3BB', 
        'vet-peach': '#FFA673',
        'vet-orange': '#FF4F0F',
        'vet-teal-rgb': 'rgb(3, 166, 161)',
        'vet-cream-rgb': 'rgb(255, 227, 187)',
        'vet-peach-rgb': 'rgb(255, 166, 115)', 
        'vet-orange-rgb': 'rgb(255, 79, 15)',
      }
    },
  },
  plugins: [],
}
