/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal-dark': '#13232f',
        'teal-light': '#1ab188',
      },
      backgroundImage: {
        'login-gradient': 'linear-gradient(135deg, #1ab188, #13232f)',
      },
    },
  },
  plugins: [],

  corePlugins: {
    preflight: false, // Desactiva el reset de estilo predeterminado de Tailwind
  }
};
