/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#1C1C1E',
        primary: '#00FFFF',
        text: '#FFFFFF',
        textMuted: '#8E8E93'
      }
    },
  },
  plugins: [],
}
