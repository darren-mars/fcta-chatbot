import type { Config } from 'tailwindcss';

const config: Config = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/aceternity-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        merriweather: ['Merriweather', 'serif'],
        garamond: ['var(--font-garamond)'],
      },
      animation: {
        spinSlow: 'spin 2s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  variants: {
    extend: {
      opacity: ['group-hover'],
      backgroundColor: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
