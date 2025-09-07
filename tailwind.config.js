// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "bg-secondary": "var(--color-bg-secondary)",
        "bg-darker": "var(--color-bg-darker)",
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          light: "var(--color-accent-light)",
        },
        "accent-sidebar": "var(--color-accent-sidebar)", // ✅ aqui!
        "text-lighter": "var(--color-text-lighter)",
      },
    },
  },
  plugins: [],
};
