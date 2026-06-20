/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "rgba(20, 20, 20, 0.6)",
        surfaceBorder: "rgba(255, 255, 255, 0.08)",
        primary: "#10b981", // Sophisticated emerald
        primaryGlow: "rgba(16, 185, 129, 0.15)",
        danger: "#f43f5e", // Rose-tinted alert red
        dangerGlow: "rgba(244, 63, 94, 0.15)",
        textMain: "#ededed",
        textMuted: "#888888",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 30px rgba(16, 185, 129, 0.2)',
        'glow-danger': '0 0 30px rgba(244, 63, 94, 0.2)',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
}