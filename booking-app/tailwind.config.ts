import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                gold: {
                    50: '#FBF9F2',
                    100: '#F5EFD7',
                    200: '#EADEAA',
                    300: '#DFCD7D',
                    400: '#D4BC50',
                    500: '#C9AB23', // Base Gold
                    600: '#A1891C',
                    700: '#796615',
                    800: '#50440E',
                    900: '#282207',
                },
                richblack: {
                    500: '#2A2A2A',
                    600: '#222222',
                    700: '#1A1A1A',
                    800: '#121212',
                    900: '#0A0A0A', // Deepest Black
                }
            },
            fontFamily: {
                sans: ['var(--font-outfit)', 'sans-serif'],
                display: ['var(--font-playfair)', 'serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a2a2a 0deg, #0a0a0a 180deg, #1a1a1a 360deg)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.7s ease-out forwards',
                'glow-pulse': 'glowPulse 3s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                glowPulse: {
                    '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(201, 171, 35, 0.3))' },
                    '50%': { filter: 'drop-shadow(0 0 15px rgba(201, 171, 35, 0.6))' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
