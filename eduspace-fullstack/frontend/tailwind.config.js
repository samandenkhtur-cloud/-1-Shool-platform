/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:'#f0f7ff', 100:'#e0efff', 200:'#baddff', 300:'#7dbeff',
          400:'#3a9bff', 500:'#0d7cf2', 600:'#005dce', 700:'#0049a7',
          800:'#033f8a', 900:'#073872', 950:'#04224a',
        },
        surface: { 50:'#fafafa', 100:'#f1f5f9', 200:'#e8edf5', 300:'#d4dce8' },
        dark: {
          bg:'#0f172a', card:'#1e293b', sidebar:'#1e293b',
          border:'rgba(255,255,255,0.08)', hover:'rgba(255,255,255,0.05)',
          text:'#e2e8f0', muted:'#94a3b8',
        },
      },
      boxShadow: {
        'card':'0 1px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 30px rgba(13,124,242,0.13), 0 2px 8px rgba(0,0,0,0.07)',
        'sidebar':'4px 0 24px rgba(0,0,0,0.08)',
        'sidebar-dark':'4px 0 24px rgba(0,0,0,0.4)',
        'dropdown':'0 12px 40px rgba(0,0,0,0.13)',
        'brand':'0 4px 20px rgba(13,124,242,0.35)',
      },
      animation: {
        'fade-in':'fadeIn 0.25s ease-out',
        'slide-up':'slideUp 0.3s ease-out',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite',
        'shimmer':'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    {'0%':{opacity:'0'},'100%':{opacity:'1'}},
        slideUp:   {'0%':{opacity:'0',transform:'translateY(10px)'},'100%':{opacity:'1',transform:'translateY(0)'}},
        pulseSoft: {'0%,100%':{opacity:'1'},'50%':{opacity:'0.5'}},
        shimmer:   {'0%':{backgroundPosition:'-200% 0'},'100%':{backgroundPosition:'200% 0'}},
      },
    },
  },
  plugins: [],
}
