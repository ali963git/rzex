import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rzex: {
          bg: '#0b0e11',
          card: '#1e2329',
          border: '#2b3139',
          text: '#eaecef',
          'text-secondary': '#848e9c',
          accent: '#f0b90b',
          green: '#0ecb81',
          red: '#f6465d',
          blue: '#1e88e5',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
