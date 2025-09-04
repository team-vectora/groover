/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Habilita a estratégia de classe para o modo escuro
  theme: {
    extend: {
      // Mapeia as variáveis CSS para as classes do Tailwind
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-darker': 'var(--color-bg-darker)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
        },
        'text-lighter': 'var(--color-text-lighter)',
      },
    },
  },
  plugins: [],
};