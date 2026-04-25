/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#1E293B',
        primary: '#8B5CF6',
        secondary: '#06B6D4',
        accent: '#F43F5E',
        text: '#F8FAFC',
        textMuted: '#94A3B8'
      }
    },
  },
  plugins: [],
}
