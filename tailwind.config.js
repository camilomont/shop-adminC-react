/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#F6F4F1',
        ink: '#3D3A36',
        muted: '#9C9690',
        line: '#ECE8E2',
        lavender: {
          DEFAULT: '#EDE8F8',
          dark: '#6B5B95',
        },
        mint: {
          DEFAULT: '#E3F5EF',
          dark: '#4A7C6A',
        },
        peach: {
          DEFAULT: '#FCE8E4',
          dark: '#B85C52',
        },
        sky: {
          DEFAULT: '#E5F0FA',
          dark: '#5B7A94',
        },
        butter: {
          DEFAULT: '#FDF5E3',
          dark: '#8A7340',
        },
        sand: {
          DEFAULT: '#F0EBE3',
          dark: '#6B6358',
        },
        wheat: {
          DEFAULT: '#E8E0D4',
          dark: '#756B5E',
        },
        taupe: {
          DEFAULT: '#DFD6C8',
          dark: '#5C5348',
        },
        linen: {
          DEFAULT: '#F7F3ED',
          dark: '#6B6358',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(61, 58, 54, 0.04)',
      },
    },
  },
  plugins: [],
};
