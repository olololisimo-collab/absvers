/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.tsx"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#8BC34A",
          "green-dark": "#7CB342",
          blue: "#1B4965",
          "blue-dark": "#144B6E",
        }
      }
    },
  },
  plugins: [],
};
