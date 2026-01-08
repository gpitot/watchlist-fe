/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        'bg-tertiary': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',

        // Surface colors
        'surface': 'rgb(var(--color-surface) / var(--color-surface-opacity))',
        'surface-hover': 'rgb(var(--color-surface) / var(--color-surface-hover-opacity))',

        // Primary colors
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
        'primary-lighter': 'rgb(var(--color-primary-lighter) / <alpha-value>)',
        'primary-dark': 'rgb(var(--color-primary-dark) / <alpha-value>)',

        // Secondary colors
        'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-light': 'rgb(var(--color-secondary-light) / <alpha-value>)',

        // Success colors
        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'success-light': 'rgb(var(--color-success-light) / <alpha-value>)',
        'success-lighter': 'rgb(var(--color-success-lighter) / <alpha-value>)',

        // Error colors
        'error': 'rgb(var(--color-error) / <alpha-value>)',
        'error-light': 'rgb(var(--color-error-light) / <alpha-value>)',
        'error-lighter': 'rgb(var(--color-error-lighter) / <alpha-value>)',

        // Text colors
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / var(--color-text-secondary-opacity))',
        'text-tertiary': 'rgb(var(--color-text-tertiary) / var(--color-text-tertiary-opacity))',
        'text-muted': 'rgb(var(--color-text-muted) / var(--color-text-muted-opacity))',

        // Border colors
        'border-default': 'rgb(var(--color-border) / var(--color-border-opacity))',
        'border-hover': 'rgb(var(--color-border) / var(--color-border-hover-opacity))',
      },
      boxShadow: {
        'primary': '0 10px 15px -3px rgb(var(--shadow-color) / 0.25)',
        'primary-lg': '0 20px 25px -5px rgb(var(--shadow-color) / 0.25)',
        'primary-sm': '0 4px 6px -1px rgb(var(--shadow-color) / 0.10)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom right, rgb(var(--color-bg-primary)), rgb(var(--color-bg-secondary)), rgb(var(--color-bg-primary)))',
        'gradient-accent': 'linear-gradient(to bottom right, rgb(var(--color-primary)), rgb(var(--color-secondary)))',
      },
    },
  },
  plugins: [],
};
