/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        spooky_bg: "#05030B",
        spooky_orange: "#ff7a1a",
        spooky_green: "#6BFFB8"
      }
    }
  },
  plugins: []
};
