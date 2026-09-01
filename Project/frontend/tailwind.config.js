export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        youtube: {
          bg: '#0f0f0f',
          surface: '#212121',
          hover: '#3f3f3f',
          border: '#3f3f3f',
          text: '#f1f1f1',
          'text-secondary': '#aaaaaa',
          red: '#ff0000',
          'red-hover': '#cc0000',
        }
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
