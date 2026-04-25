/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        backgroundStart: '#1E4B5E',
        backgroundEnd: '#0A1118',
        surface: 'rgba(20, 20, 20, 0.4)',
        surfaceHighlight: 'rgba(255, 255, 255, 0.1)',
        primary: '#E0E7FF',
        accent: '#D4AF37', // soft gold
        text: '#FFFFFF',
        textMuted: '#A0B0BA'
      }
    },
  },
  plugins: [],
}
