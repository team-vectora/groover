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
        "accent-sidebar": "var(--color-accent-sidebar)",
        "text-lighter": "var(--color-text-lighter)",
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 12s ease-in-out infinite',
        'float-reverse': 'float 15s ease-in-out infinite reverse',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.1' },
        }
      },
    },
  },
  plugins: [],
};
